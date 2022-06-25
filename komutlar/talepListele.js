// @ts-check
"use strict";

import { MessageActionRow, MessageAttachment } from "discord.js";
import { bot, noReply } from "../bilgi/ayarlar.js";
import { arşivButonlar, listeYönButonlar, listeButonlar } from "../bilgi/butonlar.js";
import { arşivTalepAl, talepAl } from "../bilgi/database.js";
import { embedOluştur, talepYetkiKontrol } from "../bilgi/fonksiyonlar.js";
import { Komut } from "../bilgi/kurucular.js";
import { talepListeleme, genelButonlar, kanalİçiTalepTürleri } from "../bilgi/türler.js";

export default new Komut({
  isim: "taleplistele",
  aktif: true,
  açıklama: "Kişinin mevcut ve eski taleplerini görüntüler.",
  çalıştır: async (message, parametre, yardımcı) => {
    const yetkiKontrol = talepYetkiKontrol(message);

    if (yetkiKontrol === undefined) return yardımcı.hataMesajGönder(`\\⚠️ Talep sistemi kapalıyken talepler incelenemez.`);
    if (!yetkiKontrol) return yardımcı.hataMesajGönder(`\\⚠️ Bu komutu kullanabilmek için gerekli yetkiniz yok.`);

    const [üye, tür, numara] = parametre;

    if (!üye) return yardımcı.hataMesajGönder(`\\📌 Üyeyi belirtmeniz gerekmektedir.`);

    const id = üye.startsWith("<@") && üye.endsWith(">") ? (üye.startsWith("<@!") ? üye.slice(3, -1) : üye.slice(2, -1)) : üye;
    const aktif = talepAl(message.guildId, id);
    const arşiv = arşivTalepAl(message.guildId, id);

    if (!aktif && !arşiv) return yardımcı.hataMesajGönder("\\📌 Verilen id ile kayıt bulunamadı.");

    const user = await bot.users.fetch(id);

    if (!tür) {
      const metin = [`\\🛎️ Aktif talebi: **${aktif ? `<#${aktif.kanal}>` : "Yok"}**`, `\\📌 Arşivde olan talepleri: **${(arşiv || []).length}** tane`].join("\r\n");
      return yardımcı.mesajGönder({
        tür: "normal",
        içerik: embedOluştur({ yazı: metin })
          .setAuthor({ name: "Kişinin talep listesi", iconURL: user.displayAvatarURL({ dynamic: true }) })
          .setFooter({ text: "💠 Daha fazla bilgi için talep türünü seçebilirsiniz." }),
      });
    }

    const talepler = ["aktif", "arşiv"];

    if (!talepler.includes(tür)) return yardımcı.hataMesajGönder(`\\📌 Talep türünü giriniz: ${talepler.map((talep) => `**${talep}**`).join(", ")}`);

    if (tür === talepler[0]) {
      if (!aktif) return yardımcı.hataMesajGönder("\\📌 Kişinin aktif talebi bulunmamaktadır.");

      const bilgi = [
        `\\💭 Mesaj sayısı: **${aktif.messages.filter((m) => !m.eylem).length}**`,
        `\\🔨 Eylem sayısı: **${aktif.messages.filter((m) => m.eylem).length}**`,
        `\\🔒 Talep kilitli mi: **${aktif.kilitli ? "Evet" : "Hayır"}**`,
        `\\🚩 Talep kanalı: <#${aktif.kanal}>`,
      ].join("\r\n");
      return yardımcı.mesajGönder({
        tür: "normal",
        içerik: embedOluştur({ yazı: bilgi })
          .setAuthor({ name: "Kişinin aktif talebi", iconURL: user.displayAvatarURL({ dynamic: true }) })
          .setFooter({ text: "💠 Daha fazla bilgi için talep kanalına gidebilirsiniz." }),
      });
    }
    if (!numara) {
      const msg = await yardımcı.mesajGönder({
        tür: "hata",
        içerik: embedOluştur({ yazı: "\\📌 Lütfen bir talep numarası giriniz." }).setFooter({ text: "💠 Talepleri listelemek için butona tıklayabilirsiniz." }),
        etkileşimler: listeButonlar,
      });
      const alınan = await msg.awaitMessageComponent({ componentType: "BUTTON", time: 30000, filter: (btn) => btn.user.id === message.author.id });
      if (!alınan) {
        try {
          return msg.edit({ components: [] }).catch(() => {});
        } catch (hata) {}
      }
      if (alınan.customId === talepListeleme.listele) {
        try {
          let talepListe = arşivTalepAl(message.guildId, id);
          let sıra = 0;
          const listeUzunluk = 2;
          const sıraBul = (sayı) => talepListe.sort((a, b) => b.zaman - a.zaman).slice(sayı * listeUzunluk, (sayı + 1) * listeUzunluk);
          const talepYenile = async (sayı = 0, zorla = false) => {
            if (zorla) talepListe = arşivTalepAl(message.guildId, id);
            sıra = sayı;
            const sayfaSayı = Math.ceil(talepListe.length / listeUzunluk);
            const bulunan = sıraBul(sıra);
            const yeniButonlar = listeYönButonlar.map((row) =>
              new MessageActionRow().addComponents(
                ...row.components.map((button) =>
                  ([talepListeleme.listeGeri, talepListeleme.listeİleri].includes(`${button.customId}`) && !bulunan?.length) ||
                  (button.customId === talepListeleme.listeİleri && sıra + 1 > sayfaSayı - 1) ||
                  (button.customId === talepListeleme.listeGeri && sıra < 1)
                    ? button.setDisabled(true)
                    : button.setDisabled(false)
                )
              )
            );
            await msg.edit({
              components: yeniButonlar,
              embeds: [
                embedOluştur({
                  tür: bulunan.length ? "normal" : "hata",
                  yazı: bulunan.length
                    ? bulunan
                        .map(
                          (değer) =>
                            `**${talepListe.indexOf(değer)}**) \`[${new Date(değer.zaman).toLocaleDateString("tr", {
                              hour: "numeric",
                              minute: "numeric",
                              second: "numeric",
                            })}]\` **>** Mesaj sayısı: **${değer.messages.filter((m) => !m.eylem).length}**, Eylem sayısı: **${değer.messages.filter((m) => m.eylem).length}**`
                        )
                        .join("\r\n")
                    : "\\🚫 Arşivde hiçbir talep bulunamadı.",
                }).setAuthor({ iconURL: user.displayAvatarURL({ size: 1024, dynamic: true }), name: `${user.tag} kişisinin talep geçmişi` }),
              ],
            });
          };
          talepYenile(0, true);
          alınan.deferUpdate();
          const collector = msg.createMessageComponentCollector({ componentType: "BUTTON", filter: (btn) => btn.user.id === message.author.id, idle: 300000 });
          collector.on("collect", async (button) => {
            const { customId, message } = button;
            //@ts-ignore
            if (customId === genelButonlar.del) return message.delete();
            if (customId === talepListeleme.listeYenile) {
              await talepYenile(0, true);
              return button.deferUpdate();
            }
            if (customId === talepListeleme.listeİleri) {
              await talepYenile(sıra + 1, false);
              return button.deferUpdate();
            }
            if (customId === talepListeleme.listeGeri) {
              await talepYenile(sıra - 1, false);
              return button.deferUpdate();
            }
          });
          collector.on("end", async () => {
            try {
              msg.edit({ components: [], embeds: msg.embeds.map((embed) => embed.setFooter({ text: `♻️ 5 dakika aktifsizlik sebebiyle butonlar kapatıldı.` })) }).catch(() => {});
              return;
            } catch (hata) {}
          });
          return;
        } catch (hata) {
          console.error(hata);
          return alınan.reply({ ephemeral: true, embeds: [embedOluştur({ tür: "hata", yazı: "\\📌 Bir hata oluştu." })], ...noReply }).catch(() => {});
        }
      }
      return;
    }
    const bulunan = arşiv.sort((a, b) => b.zaman - a.zaman);
    if (!bulunan.length) return yardımcı.hataMesajGönder("\\📌 Arşivde olan talebiniz bulunmamaktadır.");
    const alınan = bulunan[numara];
    if (!alınan) return yardımcı.hataMesajGönder("\\📌 Verdiğiniz talep numarası geçersizdir.");
    const bilgi = [`\\💭 Mesaj sayısı: **${alınan.messages.filter((m) => !m.eylem).length}**`, `\\🔨 Eylem sayısı: **${alınan.messages.filter((m) => m.eylem).length}**`].join(
      "\r\n"
    );
    const msg = await yardımcı.mesajGönder({
      tür: "normal",
      içerik: embedOluştur({ yazı: bilgi })
        .setAuthor({ name: `Kişinin ${numara} numaralı arşiv talebi`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text: "💠 Daha fazla bilgi için aşağıdaki butonları kullanabilirsiniz." }),
      etkileşimler: arşivButonlar,
    });
    const collector = msg.createMessageComponentCollector({ componentType: "BUTTON", filter: (btn) => btn.user.id === message.author.id, idle: 300000 });
    collector.on("collect", async (button) => {
      const { customId } = button;
      const message = button.message;
      // @ts-ignore
      if (customId === genelButonlar.del) return message.delete();
      if (customId === kanalİçiTalepTürleri.yazdır) {
        const mesajListe = [];
        const kişiler = [];
        const mesajlar = alınan.messages;
        for (const mesaj of mesajlar) {
          /** @type {{ zaman: Date, sahip: string, içerik: string, eylem: boolean }} */
          const { zaman, sahip, içerik, eylem } = mesaj;
          const zamanYazı = `[${new Date(zaman).toLocaleDateString("tr", { hour: "numeric", minute: "numeric", second: "numeric" }).replace(/\:/g, ".")}]`;
          if (!kişiler.find((ü) => ü.id === sahip))
            kişiler.push(
              //@ts-ignore
              message.guild.members.cache.get(sahip)
                ? //@ts-ignore
                  message.guild.members.cache.get(sahip)
                : await bot.users.fetch(sahip)
            );
          const kişi = kişiler.find((ü) => ü.id === sahip);
          const kişiYazı = `${kişi?.nickname || kişi?.user?.tag || kişi?.tag} [${kişi.id}]`;
          const sonYazı = eylem ? `${zamanYazı} > ${kişiYazı} [Eylemde Bulunuldu]: ${içerik}` : `${zamanYazı} > ${kişiYazı}: ${içerik}`;
          mesajListe.push(sonYazı);
        }
        const yazı = mesajListe.join("\r\n");
        return button.reply({ files: [new MessageAttachment(Buffer.from(yazı, "utf-8"), `arşiv-${id}.txt`)], ephemeral: true, content: "\\🖨️ Sohbet geçmişi istenildi" });
      }
    });
    collector.on("end", async () => {
      try {
        msg.edit({ components: [], embeds: msg.embeds.map((embed) => embed.setFooter({ text: `♻️ 5 dakika aktifsizlik sebebiyle butonlar kapatıldı.` })) }).catch(() => {});
        return;
      } catch (hata) {}
    });
  },
});

// @ts-check
"use strict";

import { GuildMember, MessageAttachment, TextChannel, Permissions } from "discord.js";
import { bot } from "../bilgi/ayarlar.js";
import { talepButonları, eylemButonları } from "../bilgi/butonlar.js";
import {
  talepAl,
  talepArşivle,
  talepAç,
  talepBul,
  talepKilitAç,
  talepKilitle,
  talepKontrol,
  talepMesajEkle,
  talepMesajOkuAl,
  talepMesajOkuEkle,
  talepMesajOkuÇıkar,
} from "../bilgi/database.js";
import { embedOluştur } from "../bilgi/fonksiyonlar.js";
import { Etkinlik } from "../bilgi/kurucular.js";
import { kanalİçiTalepTürleri, talepTürleri } from "../bilgi/türler.js";

export default new Etkinlik({
  isim: "talepKontrol",
  aktif: true,
  kategori: "interactionCreate",
  çalıştır: async (interaction) => {
    const { guild } = interaction;
    if (!guild) return;
    if (interaction.isButton()) {
      /**
       * @type {GuildMember}
       */
      //@ts-ignore
      const member = interaction.member;
      const { customId, channelId } = interaction;
      const talepSistem = talepKontrol(guild.id);
      if (!talepSistem) return;
      const { kategori, rol: yetkiliRol } = talepSistem;
      if (kategori && interaction.customId === talepTürleri.talep) {
        const talep = talepAl(guild.id, member.id);
        const newMember = await member.fetch();
        if (talep && !talep.kilitli)
          return interaction.reply({
            ephemeral: true,
            embeds: [embedOluştur({ tür: "hata", yazı: `\\🔰 Şu an aktif talebiniz bulunmaktadır. <#${talep.kanal}>` })],
          });
        const channel = await guild.channels.create(`talep-${newMember.nickname || newMember.user.username}`, {
          parent: kategori,
          permissionOverwrites: [
            { type: "role", id: guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
            { type: "member", id: member.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "ADD_REACTIONS", "EMBED_LINKS"] },
            { type: "role", id: `${yetkiliRol}`, allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "ADD_REACTIONS", "EMBED_LINKS"] },
          ],
          topic: `**${newMember.nickname || newMember.user.username}** ||${member.user.tag} | ${member.id}|| adlı kullanıcının talebi.`,
        });
        const msg = await channel.send({
          content: `${member.toString()} | <@&${yetkiliRol}>`,
          embeds: [
            embedOluştur({ tür: "normal", yazı: "\\🚀 Talebiniz başarıyla açılmıştır. Az sonra yetkililer size ulaşacaktır." }).setFooter({
              text: "💠 Yetkililer işlemler için aşağıdaki butonları kullanabilirler.",
            }),
          ],
          components: talepButonları,
        });
        const newMessage = await msg.pin();
        talepAç(guild.id, member.id, channel.id, newMessage.id);
        interaction.reply({ ephemeral: true, embeds: [embedOluştur({ tür: "normal", yazı: `\\👍🏻 Talebiniz başarıyla ${channel.toString()} kanalına açılmıştır.` })] });
        return;
      }
      const talepKanallar = [kategori];
      //@ts-ignore
      if (talepKanallar.includes(interaction.channel.parentId)) {
        const { ID } = talepBul(guild.id, channelId);
        /** @type {GuildMember} */
        const newMember = await member.fetch();
        const yetkiliMi =
          newMember.id !== guild.ownerId ? newMember.id !== ID && (newMember.roles.cache.get(yetkiliRol) || newMember.permissions.has("ADMINISTRATOR", true)) : true;
        if (!yetkiliMi) return interaction.deferUpdate();
        const bulunan = Object.entries(kanalİçiTalepTürleri).find(([, id]) => id === customId);
        if (!bulunan) return console.log("bulunan", bulunan);
        /** @type {{ channel: TextChannel }} */
        //@ts-ignore
        const { channel } = interaction;
        switch (customId) {
          case kanalİçiTalepTürleri.kilit:
            {
              const oku = talepMesajOkuAl().find(({ kanal }) => kanal === channelId);
              if (!oku) return;
              const { üye } = oku;
              const mevcutTalep = talepAl(guild.id, üye);
              if (!mevcutTalep) return;
              const yeniİzinler = channel.permissionOverwrites.cache.filter((mbr) => mbr.id !== üye);
              await channel.edit({ permissionOverwrites: yeniİzinler, lockPermissions: false });
              talepKilitle(guild.id, üye, member.id);
              talepMesajEkle(guild.id, üye, { zaman: Date.now(), sahip: member.id, içerik: `${"-".repeat(10)}< Kanal Kilitlendi. >${"-".repeat(10)}`, eylem: true });
              talepMesajOkuÇıkar(channelId);
              const editing = await channel.messages.fetch(mevcutTalep.mesaj);
              editing.edit({
                embeds: [
                  embedOluştur({ tür: "uyarı", yazı: `\\🔒 Talep ${member.toString()} tarafından kilitlenmiştir.` }).setFooter({
                    text: "💠 Yetkililer işlemler için aşağıdaki butonları kullanabilirler.",
                  }),
                ],
                components: eylemButonları,
              });
              interaction.deferUpdate();
            }
            break;
          case kanalİçiTalepTürleri.aç:
            {
              const { ID: üye, data: mevcutTalep } = talepBul(guild.id, channelId);
              if (!üye || !mevcutTalep) return;
              const yeniİzinler = channel.permissionOverwrites.cache.set(üye, {
                type: "member",
                id: üye,
                //@ts-ignore
                allow: new Permissions().add(["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "ADD_REACTIONS", "EMBED_LINKS"]).bitfield,
              });
              await channel.edit({ permissionOverwrites: yeniİzinler, lockPermissions: false });
              talepKilitAç(guild.id, üye);
              talepMesajEkle(guild.id, üye, { zaman: Date.now(), sahip: member.id, içerik: `${"-".repeat(10)}< Kanal Kilidi Açıldı. >${"-".repeat(10)}`, eylem: true });
              talepMesajOkuEkle({ kanal: channelId, üye, sunucu: guild.id });
              const editing = await channel.messages.fetch(mevcutTalep.mesaj);
              editing.edit({
                embeds: [
                  embedOluştur({ tür: "normal", yazı: `\\🔓 Talep ${member.toString()} tarafından açılmıştır.` }).setFooter({
                    text: "💠 Yetkililer işlemler için aşağıdaki butonları kullanabilirler.",
                  }),
                ],
                components: talepButonları,
              });
              interaction.deferUpdate();
              channel.send({ content: `<@${üye}>, talebiniz geri açılmıştır.` });
            }
            break;
          case kanalİçiTalepTürleri.yazdır:
            {
              const { ID: üye } = talepBul(guild.id, channelId);
              if (!üye) return;
              const mesajListe = [];
              const kişiler = [];
              talepMesajEkle(guild.id, üye, { zaman: Date.now(), sahip: member.id, içerik: `${"-".repeat(10)}< Sohbet Geçmişi Yazıldı. >${"-".repeat(10)}`, eylem: true });
              const mesajlar = talepAl(guild.id, üye)?.messages;
              if (!mesajlar) return;
              for (const mesaj of mesajlar) {
                const { zaman, sahip, içerik, eylem } = mesaj;
                const zamanYazı = `[${new Date(zaman).toLocaleDateString("tr", { hour: "numeric", minute: "numeric", second: "numeric" }).replace(/\:/g, ".")}]`;
                const k = kişiler.find((ü) => ü?.id === sahip);
                if (!k) kişiler.push(guild.members.cache.get(sahip) ? guild.members.cache.get(sahip) : await bot.users.fetch(sahip));
                const kişi = kişiler.find((ü) => ü?.id === sahip);
                const kişiYazı = `${kişi instanceof GuildMember ? kişi.user.tag : kişi?.tag} [${kişi?.id}]`;
                const sonYazı = eylem ? `${zamanYazı} > ${kişiYazı} [Eylemde Bulunuldu]: ${içerik}` : `${zamanYazı} > ${kişiYazı}: ${içerik}`;
                mesajListe.push(sonYazı);
              }
              const yazı = mesajListe.join("\r\n");
              interaction.reply({ files: [new MessageAttachment(Buffer.from(yazı, "utf-8"), `${channel.name}.txt`)], ephemeral: true, content: "\\🖨️ Sohbet geçmişi istenildi" });
            }
            break;
          case kanalİçiTalepTürleri.sil:
            {
              const { ID: üye, data: mevcutTalep } = talepBul(guild.id, channelId);
              if (!üye || !mevcutTalep) return;
              talepArşivle(guild.id, üye, member.id);
              const editing = await channel.messages.fetch(mevcutTalep.mesaj);
              editing.edit({ components: [] });
              interaction.reply({ embeds: [embedOluştur({ tür: "hata", yazı: "\\🗑️ Bu talep 5 saniye içinde kapatılacaktır." })] });
              setTimeout(() => channel.delete(), 5000);
            }
            break;
        }
      }
    }
  },
});

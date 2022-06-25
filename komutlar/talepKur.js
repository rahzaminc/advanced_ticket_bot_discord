// @ts-check
"use strict";

import { Util } from "discord.js";
import { prefixAl, talepAyarla } from "../bilgi/database.js";
import { embedOluştur, kanalBul, rolBul, yetkiKontrol } from "../bilgi/fonksiyonlar.js";
import { Komut } from "../bilgi/kurucular.js";

export default new Komut({
  isim: "talepkur",
  aktif: true,
  açıklama: "Talep sistemini ayarlar.",
  çalıştır: async (message, parametre, yardımcı) => {
    const yetki = yetkiKontrol(message);
    if (!yetki) return yardımcı.hataMesajGönder(`\\⚠️ Bu komutu kullanabilmek için **Yönetici** yetkisi gerekmektedir.`);
    const [kanal, rol] = parametre;
    if (kanal === "sil") {
      talepAyarla({ sunucu: message.guildId });
      return yardımcı.başarıMesajGönder(`\\🗑️ Talep sistemi kapatıldı.`);
    }
    if (!kanal) {
      const prefix = prefixAl(message.guildId);
      return yardımcı.hataMesajGönder(
        embedOluştur({
          tür: "hata",
          yazı: `\\⚠️ Bir kategori kanalı ve yetkili rolü girmeniz gerekmektedir.\r\n\\➡️ ${Util.escapeMarkdown(prefix)}talepkur {kategoriKanalı} {talepYetkiliRolü}`,
        }).setFooter({ text: "💡 Kanal yerine sil yazarak talep sistemini kapatabilirsiniz." })
      );
    }
    const bulunanKanal = kanalBul({ sunucu: message.guildId, id: kanal });
    if (!bulunanKanal) return yardımcı.hataMesajGönder("\\⚠️ Aradığınız kanal bulunamadı.");
    if (bulunanKanal.type !== "GUILD_CATEGORY") return yardımcı.hataMesajGönder("\\⚠️ Belirttiğiniz kanal kategori kanalı değil.");
    const bulunanRol = rolBul({ sunucu: message.guildId, id: rol });
    if (!bulunanRol) return yardımcı.hataMesajGönder("\\⚠️ Aradığınız rol bulunamadı.");
    if (bulunanRol.id === message.guild.roles.everyone.id || bulunanRol.managed) return yardımcı.hataMesajGönder("\\⚠️ Belirttiğiniz rol eklenmeye uygun değil.");
    talepAyarla({ sunucu: message.guildId, kategori: bulunanKanal.id, rol: bulunanRol.id });
    return yardımcı.başarıMesajGönder(`\\🎚️ Talep kategori kanalı ${bulunanKanal.toString()} ve yetkili rolü ${bulunanRol.toString()} olarak ayarlandı.`);
  },
});

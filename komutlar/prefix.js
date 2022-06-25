// @ts-check
"use strict";

import { Util } from "discord.js";
import { prefixUzunluk } from "../bilgi/ayarlar.js";
import { prefixAyarla } from "../bilgi/database.js";
import { yetkiKontrol } from "../bilgi/fonksiyonlar.js";
import { Komut } from "../bilgi/kurucular.js";

export default new Komut({
  isim: "prefix",
  aktif: true,
  açıklama: "Botun prefixini değiştirir.",
  çalıştır: async (message, parametre, yardımcı) => {
    const yetki = yetkiKontrol(message);
    if (!yetki) return yardımcı.hataMesajGönder(`\\⚠️ Bu komutu kullanabilmek için **Yönetici** yetkisi gerekmektedir.`);
    const yeniPrefix = parametre[0];
    if (!yeniPrefix || yeniPrefix.length > prefixUzunluk)
      return yardımcı.hataMesajGönder(`\\⚠️ Yeni prefixi belirleyiniz ve en fazla **${prefixUzunluk}** karakter uzunluğunda tutunuz.`);
    prefixAyarla({ sunucu: message.guild.id, yeniPrefix });
    return yardımcı.başarıMesajGönder(`\\🎚️ Yeni prefix **${Util.escapeMarkdown(yeniPrefix)}** olarak değiştirildi`);
  },
});

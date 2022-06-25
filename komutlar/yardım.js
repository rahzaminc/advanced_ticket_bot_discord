// @ts-check
"use strict";

import { dosyaSistem } from "../bilgi/ayarlar.js";
import { Komut } from "../bilgi/kurucular.js";
import { prefixAl } from "../bilgi/database.js";
import { Util } from "discord.js";
import { embedOluştur } from "../bilgi/fonksiyonlar.js";

export default new Komut({
  isim: "yardım",
  aktif: true,
  açıklama: "Yardım menüsünü gösterir",
  çalıştır: async (mesaj, parametre, yardımcı) => {
    const prefix = prefixAl(mesaj.guildId);
    const komutBilgi = dosyaSistem.komutlar.map(({ isim, açıklama }) => `\\🔹 **${Util.escapeMarkdown(prefix)}${isim}**: ${açıklama}`).join("\r\n");
    return yardımcı.normalMesajGönder(
      embedOluştur({ yazı: komutBilgi })
        .setAuthor({ iconURL: mesaj.client.user?.displayAvatarURL(), name: "Komutlar" })
        .setFooter({ text: "💡 Komutu yazarak nasıl kullanıldığını görebilirsiniz." })
    );
  },
});

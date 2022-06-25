// @ts-check
"use strict";

import { butonListe } from "../bilgi/butonlar.js";
import { talepKontrol } from "../bilgi/database.js";
import { embedOluştur, yetkiKontrol } from "../bilgi/fonksiyonlar.js";
import { Komut } from "../bilgi/kurucular.js";

export default new Komut({
  isim: "butonkur",
  aktif: true,
  açıklama: "Talep yardım metnini kanala gönderir.",
  çalıştır: async (message, parametre, yardımcı) => {
    const yetki = yetkiKontrol(message);
    if (!yetki) return yardımcı.hataMesajGönder(`\\⚠️ Bu komutu kullanabilmek için **Yönetici** yetkisi gerekmektedir.`);
    const talep = talepKontrol(message.guildId);
    if (!talep) return yardımcı.hataMesajGönder(`\\⚠️ Butonları aktifleştirmek için talep sisteminin açık olması gerekmektedir.`);
    return yardımcı.mesajGönder({
      yanıtla: false,
      tür: "normal",
      içerik: embedOluştur({ yazı: "\\👋🏻 Talep açmak için aşağıdaki butonları kullanabilirsiniz!" }).setFooter({ text: "💠 Aynı anda sadece bir talep açabilirsiniz." }),
      etkileşimler: butonListe,
    });
  },
});

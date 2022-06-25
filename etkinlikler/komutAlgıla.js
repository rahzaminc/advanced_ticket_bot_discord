// @ts-check
"use strict";

import { dosyaSistem } from "../bilgi/ayarlar.js";
import { prefixAl } from "../bilgi/database.js";
import { Etkinlik, MesajYardımcı } from "../bilgi/kurucular.js";

export default new Etkinlik({
  isim: "komutAlgıla",
  aktif: true,
  kategori: "messageCreate",
  çalıştır: async (message) => {
    if (!message.guild || message.author?.bot) return;
    const content = message.content;

    const prefix = prefixAl(message.guild.id);
    if (!content.startsWith(prefix)) return;

    const ayrılmış = content.slice(prefix.length).split(" ");
    const komut = ayrılmış[0];
    const parametre = ayrılmış.slice(1);

    if (!komut) return;
    const { komutlar } = dosyaSistem;
    const alınan = komutlar.find((kmt) => kmt.isim === komut);
    if (!alınan) return;

    const yardımcı = new MesajYardımcı(message);
    // @ts-ignore
    return alınan.çalıştır(message, parametre, yardımcı);
  },
});

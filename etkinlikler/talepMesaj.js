// @ts-check
"use strict";

import { sunucular, talepMesajEkle, talepMesajOkuAl } from "../bilgi/database.js";
import { Etkinlik } from "../bilgi/kurucular.js";

export default new Etkinlik({
  isim: "talepMesaj",
  aktif: true,
  kategori: "messageCreate",
  çalıştır: async (message) => {
    if (!message.guild || message.author?.bot || message.channel.type === "DM") return;
    const kategoriler = sunucular
      .valueArray()
      .map((sunucu) => sunucu.talep)
      .filter((talep) => talep);
    // @ts-ignore
    if (!kategoriler.find((ayar) => ayar.kategori === message.channel.parentId)) return;
    const alınan = talepMesajOkuAl().find(({ kanal }) => kanal === message.channelId);
    if (!alınan) return;
    const { üye } = alınan;
    talepMesajEkle(message.guild.id, üye, { zaman: Date.now(), sahip: message.author.id, içerik: message.content });
  },
});

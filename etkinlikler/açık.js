// @ts-check
"use strict";

import { Etkinlik } from "../bilgi/kurucular.js";

export default new Etkinlik({
  isim: "açık",
  aktif: true,
  kategori: "ready",
  çalıştır: async (client) => {
    console.info([`* Bot ile { ${client.user.tag} } giriş yapıldı.`, `$ Botun sunucu sayısı: ${client.guilds.cache.size} sunucu`].join("\r\n"));
  },
});

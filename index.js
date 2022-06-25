// @ts-check
"use strict";

import { bot, token, dosyaSistem } from "./bilgi/ayarlar.js";
import { readdir } from "fs/promises";
import { Etkinlik, Komut } from "./bilgi/kurucular.js";

await (async () => {
  const okunan = (await readdir("./etkinlikler")).filter((dosya) => dosya.endsWith(".js"));
  if (!okunan.length) return console.warn("# Klasörde hiçbir etkinlik bulunamadı.");
  for (const etkinlik of okunan) {
    const { default: etkinlikDosya } = await import(`./etkinlikler/${etkinlik}`);
    if (!etkinlikDosya || !(etkinlikDosya instanceof Etkinlik)) {
      console.warn(`# "${etkinlik}" etkinliğinde etkinlik çıktısı bulunamadı.`);
      continue;
    }
    const { isim, aktif, çalıştır, kategori } = etkinlikDosya;
    if (typeof isim !== "string" || typeof aktif !== "boolean" || typeof çalıştır !== "function" || typeof kategori !== "string") {
      console.warn(`# "${etkinlik}" etkinliğinde hata var.`);
      continue;
    }
    dosyaSistem.etkinlikler.push(etkinlikDosya);
    console.info(`* Etkinlik yüklendi: "${etkinlik}"`);
  }
  if (!dosyaSistem.etkinlikler.length) return;
  for (const etkinlik of dosyaSistem.etkinlikler) {
    bot.on(etkinlik.kategori, async (...parametre) => etkinlik.çalıştır(...parametre));
  }
})();

await (async () => {
  const okunan = (await readdir("./komutlar")).filter((dosya) => dosya.endsWith(".js"));
  if (!okunan.length) return console.warn("# Klasörde hiçbir komut bulunamadı.");
  for (const komut of okunan) {
    const { default: komutDosya } = await import(`./komutlar/${komut}`);
    if (!komutDosya || !(komutDosya instanceof Komut)) {
      console.warn(`# "${komut}" komutunda komut çıktısı bulunamadı.`);
      continue;
    }
    const { isim, aktif, çalıştır } = komutDosya;
    if (typeof isim !== "string" || typeof aktif !== "boolean" || typeof çalıştır !== "function") {
      console.warn(`# "${komut}" komutunda hata var.`);
      continue;
    }
    dosyaSistem.komutlar.push(komutDosya);
    console.info(`* Komut yüklendi: "${komut}"`);
  }
})();

process.on("unhandledRejection", async (hata) => console.warn(`# Bilinmeyen bir hata gerçekleşti:`, hata));

console.info(
  [
    `>${"~".repeat(60)}<`,
    `- Kurulan komut sayısı: ${dosyaSistem.komutlar.length}`,
    `- Kurulan etkinlik sayısı: ${dosyaSistem.etkinlikler.length}`,
    `- Hata ayıklama sistemi aktif!`,
    `$ Bot az sonra başlatılacaktır...`,
    `>${"~".repeat(60)}<`,
  ].join("\r\n")
);

await bot.login(token);

export {};

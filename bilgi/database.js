// @ts-check
"use strict";

import { JsonDatabase } from "wio.db";
import { prefix, snowflakeUzunluk } from "./ayarlar.js";

export const aktifTalepler = new JsonDatabase({ databasePath: "./aktifTalepler" });
export const arşivTalepler = new JsonDatabase({ databasePath: "./arşivTalepler" });
export const sunucular = new JsonDatabase({ databasePath: "./sunucular" });

// Sunucular

/**
 * Sunucu prefixini ayarlar.
 * @param {{
 * sunucu: string,
 * yeniPrefix?: string
 * }} prefixBilgisi
 */
export const prefixAyarla = (prefixBilgisi) => {
  const { sunucu = undefined, yeniPrefix = undefined } = prefixBilgisi;
  if (typeof sunucu !== "string" || sunucu.length !== snowflakeUzunluk)
    throw new Error(`[Hata] Sunucu verisi yazı şeklinde olmalıdır ve ${snowflakeUzunluk} uzunluğunda olmalıdır. (Prefix ayarlama)`);
  if (!["undefined", "string"].includes(typeof yeniPrefix)) throw new Error(`[Hata] Yeni prefix verisi yazı şeklinde olmalıdır veya girilmemelidir. (Prefix ayarlama)`);
  const yazı = `${sunucu}.prefix`;
  typeof yeniPrefix !== "string" || yeniPrefix === prefix ? sunucular.delete(yazı) : sunucular.set(yazı, yeniPrefix);
  return yeniPrefix || prefix;
};

/**
 * Sunucu prefixini alır.
 * @param {string} sunucu
 * @returns {string}
 */
export const prefixAl = (sunucu) => {
  if (typeof sunucu !== "string" || sunucu.length !== snowflakeUzunluk)
    throw new Error(`[Hata] Sunucu verisi yazı şeklinde olmalıdır ve ${snowflakeUzunluk} uzunluğunda olmalıdır. (Prefix ayarlama)`);
  const yazı = `${sunucu}.prefix`;
  return sunucular.get(yazı) || prefix;
};

/**
 * Sunucu talep sistemini ayarlar.
 * @param {{
 * sunucu: string,
 * kategori?: string
 * rol?: string
 * }} talepSistemBilgisi
 */
export const talepAyarla = (talepSistemBilgisi) => {
  const { sunucu = undefined, kategori = undefined, rol = undefined } = talepSistemBilgisi;
  if (typeof sunucu !== "string" || sunucu.length !== snowflakeUzunluk)
    throw new Error(`[Hata] Sunucu verisi yazı şeklinde olmalıdır ve ${snowflakeUzunluk} uzunluğunda olmalıdır. (Talep sistem ayarlama)`);
  if (!["undefined", "string"].includes(typeof kategori) || (typeof kategori === "string" && kategori.length !== snowflakeUzunluk))
    throw new Error(`[Hata] Kategori kanalı verisi yazı şeklindeyken ${snowflakeUzunluk} uzunluğunda olmalıdır veya girilmemelidir. (Talep sistem ayarlama)`);
  const yazı = `${sunucu}.talep`;
  typeof kategori !== "string" && typeof rol !== "string" ? sunucular.delete(yazı) : sunucular.set(yazı, { kategori, rol });
  return { kategori, rol };
};

/**
 * @param {string} sunucu
 * @returns {{ kategori: string, rol: string } | undefined}
 */
export const talepKontrol = (sunucu) => {
  const yazı = `${sunucu}.talep`;
  return sunucular.get(yazı);
};

// Talep sistemi

/**
 * @param {string} sunucu
 * @param {string} kişi
 * @param {string} yetkiliId
 */
export const talepArşivle = (sunucu, kişi, yetkiliId) => {
  const talepMesaj = { zaman: Date.now(), sahip: yetkiliId, içerik: `${"-".repeat(10)}< Talep Silindi. >${"-".repeat(10)}`, eylem: true };
  talepMesajEkle(sunucu, kişi, talepMesaj);
  const talep = talepAl(sunucu, kişi);
  const yazı = `${sunucu}.${kişi}`;
  arşivTalepler.push(yazı, talep);
  aktifTalepler.delete(yazı);
};
/**
 * @param {string} sunucu
 * @param {string} kişi
 * @param {TalepMesajİçerik} mesaj
 */
export const talepMesajEkle = (sunucu, kişi, mesaj) => {
  const yazı = `${sunucu}.${kişi}.messages`;
  aktifTalepler.push(yazı, mesaj);
  return;
};
/**
 * @param {string} sunucu
 * @param {string} kişi
 * @param {string} kanalId
 * @param {string} mesajId
 */
export const talepAç = (sunucu, kişi, kanalId, mesajId) => {
  const yazı = `${sunucu}.${kişi}`;
  aktifTalepler.set(yazı, { messages: [], kilitli: false, kanal: kanalId, mesaj: mesajId, zaman: Date.now() });
  return talepMesajOkuEkle({ kanal: kanalId, sunucu, üye: kişi });
};
/**
 * @param {string} sunucu
 * @param {string} kişi
 * @param {string} yetkiliId
 */
export const talepKilitle = (sunucu, kişi, yetkiliId) => {
  const yazı = `${sunucu}.${kişi}.kilitli`;
  aktifTalepler.set(yazı, yetkiliId);
  return;
};
/**
 * @param {string} sunucu
 * @param {string} kişi
 */
export const talepKilitAç = (sunucu, kişi) => {
  const yazı = `${sunucu}.${kişi}.kilitli`;
  aktifTalepler.set(yazı, false);
  return;
};
/**
 * @param {string} sunucu
 * @param {string} kişi
 */
export const talepAl = (sunucu, kişi) => {
  const yazı = `${sunucu}.${kişi}`;
  /** @type {Talep | undefined} */
  const alınanTalep = aktifTalepler.get(yazı);
  return alınanTalep;
};
/**
 * @param {string} sunucu
 * @param {string} kanal
 * @returns {{ ID: string | undefined, data: Talep | undefined }}
 */
export const talepBul = (sunucu, kanal) => {
  const d = Object.entries(aktifTalepler.get(sunucu)).find(([, data]) => {
    return data.kanal === kanal;
  });
  return d ? { ID: d[0], data: d[1] } : { ID: undefined, data: undefined };
};
export const talepMesajOkuAl = () => {
  /** @type {TalepMesajOku[]} */
  const alınanTalepler = aktifTalepler.get("mesajOku");
  return alınanTalepler;
};
/**
 * @param {TalepMesajOku} içerik
 */
export const talepMesajOkuEkle = (içerik) => {
  aktifTalepler.push("mesajOku", içerik);
  return;
};
/**
 * @param {string} kanalId
 */
export const talepMesajOkuÇıkar = (kanalId) => {
  aktifTalepler.set(
    "mesajOku",
    talepMesajOkuAl().filter(({ kanal }) => kanal !== kanalId)
  );
  return;
};
/**
 * @param {string} sunucu
 * @param {string} kişi
 * @returns {ArşivTalep[]}
 */
export const arşivTalepAl = (sunucu, kişi) => {
  const yazı = `${sunucu}.${kişi}`;
  return arşivTalepler.get(yazı);
};

// Türler

/**
 * @typedef {{
 * kilitli: boolean | string,
 * messages: TalepMesajİçerik[],
 * kanal: string,
 * mesaj: string,
 * zaman: number
 * }} Talep
 *
 * @typedef {{
 * zaman: number,
 * sahip: string,
 * içerik: string,
 * eylem?: boolean
 * }} TalepMesajİçerik
 *
 * @typedef {{
 * kanal: string,
 * üye: string,
 * sunucu: string
 * }} TalepMesajOku
 *
 * @typedef {Talep} ArşivTalep
 */

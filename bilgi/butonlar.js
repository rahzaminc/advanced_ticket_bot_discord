// @ts-check
"use strict";

import { butonKur } from "./fonksiyonlar.js";
import { genelButonlar, talepListeleme, kanalİçiTalepTürleri, talepTürleri } from "./türler.js";

const { del } = genelButonlar;
const { listele, listeİleri, listeGeri, listeYenile } = talepListeleme;
const { kilit, yazdır, aç, sil } = kanalİçiTalepTürleri;
const { talep } = talepTürleri;

export const butonListe = butonKur([{ customId: talep, label: "Talep aç!", style: "PRIMARY", emoji: "📫", disabled: false }]);
export const talepButonları = butonKur([{ customId: kilit, label: "Talebi Kilitle", style: "DANGER", emoji: "🔒" }]);
export const eylemButonları = butonKur([
  { customId: aç, label: "Talebi Geri Aç", style: "PRIMARY", emoji: "🔓" },
  { customId: sil, label: "Talebi Sil", style: "DANGER", emoji: "🗑️" },
  { customId: yazdır, label: "Sohbet Çıktısı Al", style: "SUCCESS", emoji: "🖨️" },
]);
export const listeButonlar = butonKur([{ customId: listele, label: "Talepleri Listele", style: "PRIMARY", emoji: "🗃️" }]);
export const listeYönButonlar = butonKur([
  { customId: listeGeri, label: "Geri", style: "PRIMARY", emoji: "◀️", disabled: true },
  { customId: listeYenile, label: "Yenile", style: "SUCCESS", emoji: "🔃" },
  { customId: listeİleri, label: "İleri", style: "PRIMARY", emoji: "▶️" },
  { customId: del, label: "Sil", style: "DANGER", emoji: "🗑️" },
]);
export const arşivButonlar = butonKur([
  { customId: yazdır, label: "Sohbet Çıktısı Al", style: "SUCCESS", emoji: "🖨️" },
  { customId: del, label: "Sil", style: "DANGER", emoji: "🗑️" },
]);

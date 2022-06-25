// @ts-check
"use strict";

import { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { bot, renkler, snowflakeUzunluk } from "./ayarlar.js";
import { talepKontrol } from "./database.js";

/** @param {import("discord.js").MessageButtonOptions[]} butonlar */
export const butonKur = (butonlar) => {
  let sıra = 0;
  let current = new MessageActionRow();
  const rows = [];
  for (const buton of butonlar) {
    if (sıra % 5 === 0 && sıra !== 0) {
      if (rows.length === 5) {
        console.warn("# Buton sayısı 25'ten fazla! Kalan butonlar eklenemiyor.");
        return rows;
      }
      rows.push(current);
      sıra = 0;
      current = new MessageActionRow();
    }
    current.addComponents(new MessageButton(buton));
    sıra++;
  }
  if (current.components.length) rows.push(current);
  return rows;
};

/** @param {Message} mesaj */
// @ts-ignore
export const yetkiKontrol = (mesaj) => mesaj.member.permissions.has("ADMINISTRATOR", true) || mesaj.member.id === mesaj.guild.ownerId;

/** @param {Message} mesaj */
export const talepYetkiKontrol = (mesaj) => {
  const talepSistem = talepKontrol(`${mesaj.guildId}`);
  if (!talepSistem) return;
  const { rol } = talepSistem;
  // @ts-ignore
  return mesaj.member.roles.cache.has(rol) || mesaj.member.permissions.has("ADMINISTRATOR", true) || mesaj.member.id === mesaj.guild.ownerId;
};

/**
 * Belirtilen sunucudan ya da bottan bir kanal bulur.
 * @param {{
 * sunucu: string | undefined
 * id: string
 * }} kanalBilgi
 */
export const kanalBul = (kanalBilgi) => {
  const { sunucu = undefined, id = undefined } = kanalBilgi;
  if (!["undefined", "string"].includes(typeof sunucu) || (typeof sunucu === "string" && sunucu.length !== snowflakeUzunluk))
    throw new Error(`[Hata] Sunucu verisi yazı şeklindeyken ${snowflakeUzunluk} uzunluğunda olmalıdır veya girilmemelidir. (Kanal bulma)`);
  if (typeof id !== "string") throw new Error(`[Hata] Kanal verisi yazı şeklinde olmalıdır. (Kanal bulma)`);
  const alınanId = id.startsWith("<#") && id.endsWith(">") ? id.slice(2, -1) : Number(id) !== NaN ? id : undefined;
  if (alınanId?.length !== snowflakeUzunluk) return undefined;
  return sunucu !== undefined ? bot.guilds.cache.get(sunucu)?.channels.cache.get(id) : bot.channels.cache.get(id);
};

/**
 * Belirtilen sunucudan bir rol bulur.
 * @param {{
 * sunucu: string
 * id: string
 * }} rolBilgi
 */
export const rolBul = (rolBilgi) => {
  const { sunucu = undefined, id = undefined } = rolBilgi;
  if (typeof sunucu === "string" && sunucu.length !== snowflakeUzunluk)
    throw new Error(`[Hata] Sunucu verisi yazı şeklinde ve ${snowflakeUzunluk} uzunluğunda olmalıdır. (Rol bulma)`);
  if (typeof id !== "string") throw new Error(`[Hata] Rol verisi yazı şeklinde olmalıdır. (Rol bulma)`);
  const alınanId = id.startsWith("<@&") && id.endsWith(">") ? id.slice(3, -1) : Number(id) !== NaN ? id : undefined;
  if (alınanId?.length !== snowflakeUzunluk) return undefined;
  return bot.guilds.cache.get(`${sunucu}`)?.roles.cache.get(alınanId);
};

/**
 * @param {{
 * tür?: "hata" | "uyarı" | "normal" | "başarı"
 * yazı?: string
 * }} embedBilgi
 */
export const embedOluştur = (embedBilgi) => {
  const { yazı, tür } = embedBilgi;
  const embed = new MessageEmbed();
  if (tür) embed.setColor(renkler[tür]);
  if (yazı) embed.setDescription(yazı);
  return embed;
};

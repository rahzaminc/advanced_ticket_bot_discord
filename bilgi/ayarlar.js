// @ts-check
"use strict";

import { Client } from "discord.js";
import { Etkinlik, Komut } from "./kurucular.js";

// Detaylı ayarlar (Ellemeyiniz)

/** @type {{ komutlar: Komut[], etkinlikler: Etkinlik<keyof ClientEvents>[] }} */
export const dosyaSistem = { etkinlikler: [], komutlar: [] };
export const noReply = { allowedMentions: { parse: [] } };
export const bot = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"], restTimeOffset: 0, retryLimit: Infinity, failIfNotExists: false });

// Botun özeli

export const token = "OTU3NjU3MTMyMTI2MzIyNzg4.GTEd9y.NaZqnUnkaHu-APCjj-79c6Nml90scC4tpXgT7A";
export const prefix = "?"; // Sunucuya özel olarak bot içinden değiştirilebilir

// Renk ayarları

/**
 * @type {{ hata: ColorResolvable, normal: ColorResolvable, başarı: ColorResolvable, uyarı: ColorResolvable }}
 */
export const renkler = { hata: "RED", normal: "BLUE", başarı: "GREEN", uyarı: "YELLOW" };

// Bilgiler

export const prefixUzunluk = 10;

// Discord.js

export const snowflakeUzunluk = "111111111111111111".length;

// Türler

/**
 * @typedef {import("discord.js").ClientEvents} ClientEvents
 * @typedef {import("discord.js").ColorResolvable} ColorResolvable
 */

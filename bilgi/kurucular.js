// @ts-check
import { Message, MessageActionRow, MessageEmbed } from "discord.js";
import { renkler } from "./ayarlar.js";

export class MesajYardımcı {
  /**
   * @param {Message} mesaj
   */
  constructor(mesaj) {
    /**
     * @private
     */
    this.mesaj = mesaj;
  }
  /**
   * Kanala mesaj gönderir. Kullanılacak mesajı belirtebilirsiniz ve varsayılan olarak o mesajı yanıtlar.
   * @param {{
   * mesaj?: Message
   * tür?: "hata" | "normal" | "başarı" | "uyarı"
   * içerik: MesajGönderimİçerik
   * yanıtla?: boolean
   * etiketle?: boolean
   * etkileşimler?: MessageActionRow[]
   * }} gönderimBilgi
   */
  mesajGönder = async (gönderimBilgi) => {
    const { tür = "normal", içerik, mesaj, yanıtla = true, etiketle = false, etkileşimler } = gönderimBilgi;
    const renk = renkler[tür];
    const gönderimMesaj = mesaj || this.mesaj;
    const yanıtlaBilgi = etiketle ? {} : { allowedMentions: { parse: [] } };
    /**
     * @param {MessageOptions} msg
     */
    const gönder = async (msg) => await (yanıtla ? gönderimMesaj.reply(msg) : gönderimMesaj.channel.send(msg));
    /**
     * @type {MessageOptions}
     */
    const ekBilgi = {
      ...yanıtlaBilgi,
      components: etkileşimler,
    };
    if (içerik instanceof MessageEmbed) return await gönder({ embeds: [içerik.setColor(renk)], ...ekBilgi });
    if (typeof içerik === "string") return await gönder({ embeds: [new MessageEmbed().setColor(renk).setDescription(içerik)], ...ekBilgi });
    return await gönder({ ...içerik, ...ekBilgi });
  };
  /**
   * Kanala hata mesajı gönderir.
   * @param {MesajGönderimİçerik} içerik
   */
  hataMesajGönder = async (içerik) => await this.mesajGönder({ içerik, tür: "hata" });
  /**
   * Kanala uyarı mesajı gönderir.
   * @param {MesajGönderimİçerik} içerik
   */
  uyarıMesajGönder = async (içerik) => await this.mesajGönder({ içerik, tür: "uyarı" });
  /**
   * Kanala başarı mesajı gönderir.
   * @param {MesajGönderimİçerik} içerik
   */
  başarıMesajGönder = async (içerik) => await this.mesajGönder({ içerik, tür: "başarı" });
  /**
   * Kanala normal mesaj gönderir.
   * @param {MesajGönderimİçerik} içerik
   */
  normalMesajGönder = async (içerik) => await this.mesajGönder({ içerik, tür: "normal" });
}

export class Komut {
  /**
   * Kurulacak komutun bilgisi
   * @param {{
   * isim: string
   * aktif: boolean
   * açıklama: string
   * çalıştır: (message: Message<true>, parametre: string[], yardımcı: MesajYardımcı) => Promise<any> | any
   * }} komutBilgi
   */
  constructor(komutBilgi) {
    const { isim, aktif, çalıştır, açıklama } = komutBilgi;
    this.isim = isim;
    this.aktif = aktif;
    this.çalıştır = çalıştır;
    this.açıklama = açıklama;
  }
}

/** @template {keyof ClientEvents} Tür */
export class Etkinlik {
  /**
   * Kurulacak etkinliğin bilgisi
   * @param {{
   * isim: string,
   * aktif: boolean
   * kategori: Tür
   * çalıştır: (...parametreler: ClientEvents[Tür]) => Promise<any> | any
   * }} etkinlikBilgi
   */
  constructor(etkinlikBilgi) {
    const { isim, aktif, kategori, çalıştır } = etkinlikBilgi;
    this.isim = isim;
    this.aktif = aktif;
    this.kategori = kategori;
    this.çalıştır = çalıştır;
  }
}

// Türler

/**
 * @typedef {import("discord.js").ClientEvents} ClientEvents
 * @typedef {import("discord.js").MessageOptions} MessageOptions
 * @typedef {string | MessageEmbed | MessageOptions} MesajGönderimİçerik
 */

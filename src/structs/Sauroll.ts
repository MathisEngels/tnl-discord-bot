import { EmbedBuilder, Message, VoiceBasedChannel } from "discord.js";
import { getSaurollData } from "../api/sauroll";
import SaurollPingEmbed from "../components/sauroll/ping";
import ExtendedClient from "./ExtendedClient";
import { saurollButtonRow, SaurollRollEmbed } from "../components/sauroll/roll";
import { SaurollPlayer } from "../types/sauroll";

export default class Sauroll {
  client: ExtendedClient;

  optInPlayers = new Map<string, string[]>();
  optOutPlayers = new Map<string, string[]>();
  passPlayers = new Map<string, string[]>();
  messages = new Map<string, Message>();
  players = new Map<string, SaurollPlayer[]>();

  constructor(client: ExtendedClient) {
    this.client = client;
  }

  getPlayers(guildId: string, channel: VoiceBasedChannel) {
    const playerInChannel = channel.members;

    const optIn = this.optInPlayers.get(guildId) || [];
    const optOut = this.optOutPlayers.get(guildId) || [];

    const filteredPlayers = playerInChannel.filter((p) => !optOut.includes(p.id)).map((p) => p.id);

    return [...new Set([...filteredPlayers, ...optIn])];
  }

  pass(guildId: string, playerId: string) {
    this.passPlayers.set(guildId, [...(this.passPlayers.get(guildId) || []), playerId]);
    this.updateRoll(guildId);
  }

  optIn(guildId: string, playerId: string) {
    if (this.optOutPlayers.get(guildId)?.includes(playerId)) {
      this.optOutPlayers.set(
        guildId,
        (this.optOutPlayers.get(guildId) || []).filter((p) => p !== playerId)
      );
    }

    this.optInPlayers.set(guildId, [...(this.optInPlayers.get(guildId) || []), playerId]);
  }

  optOut(guildId: string, playerId: string) {
    if (this.optInPlayers.get(guildId)?.includes(playerId)) {
      this.optInPlayers.set(
        guildId,
        (this.optInPlayers.get(guildId) || []).filter((p) => p !== playerId)
      );
    }

    this.optOutPlayers.set(guildId, [...(this.optOutPlayers.get(guildId) || []), playerId]);
    this.updateRoll(guildId);
  }

  resetPassPlayers() {
    this.passPlayers.clear();
  }

  reset() {
    this.optInPlayers.clear();
    this.optOutPlayers.clear();
    this.passPlayers.clear();
    this.messages.clear();
  }

  async ping() {
    const saurollData = await getSaurollData();

    for (const { discordSaurollChannelId, discordSaurollRoleId } of saurollData) {
      const saurollChannel = await this.client.channels.fetch(discordSaurollChannelId);
      if (!saurollChannel || !saurollChannel.isVoiceBased()) break;

      const message = await saurollChannel.send({ embeds: [SaurollPingEmbed(discordSaurollChannelId, discordSaurollRoleId)] });

      this.messages.set(discordSaurollChannelId, message);
    }
  }

  async postRoll(chestNumber: number) {
    const saurollData = await getSaurollData();

    for (const { discordSaurollChannelId } of saurollData) {
      const saurollChannel = await this.client.channels.fetch(discordSaurollChannelId);
      if (!saurollChannel || !saurollChannel.isVoiceBased()) break;

      const players = this.getPlayers(saurollChannel.guild.id, saurollChannel)
        .map((playerId) => ({ playerId, roll: 1 + Math.floor(Math.random() * 100) }))
        .sort((a, b) => b.roll - a.roll);

      this.players.set(saurollChannel.guild.id, players);

      const prevMessage = this.messages.get(saurollChannel.guild.id);
      let message;
      if (!prevMessage) {
        message = await saurollChannel.send({ embeds: [SaurollRollEmbed(players, chestNumber, discordSaurollChannelId)], components: [saurollButtonRow] });

        this.messages.set(saurollChannel.guild.id, message);
      } else {
        message = await prevMessage.edit({ embeds: [SaurollRollEmbed(players, chestNumber, discordSaurollChannelId)], components: [saurollButtonRow] });
      }
    }
  }

  async updateRoll(guildId: string) {
    const message = this.messages.get(guildId);
    if (!message) {
      console.error("Message not found");
      return;
    }

    const prevPlayers = this.players.get(guildId) || [];

    const optOutPlayers = this.optOutPlayers.get(guildId) || [];
    const passPlayers = this.passPlayers.get(guildId) || [];

    const players = prevPlayers
      ?.filter((p) => !optOutPlayers.includes(p.playerId))
      .map((p) => ({
        ...p,
        pass: passPlayers.includes(p.playerId),
      }));

    const fields = [];

    if (players.length !== 0) {
      players.sort((a, b) => b.roll - a.roll);

      for (let i = 0; i < players.length % 10; i++) {
        let str = "";

        for (let j = 0; j < players.length; j++) {
          const player = players[j];

          let tmpStr = `\`${j + 1}.\` <@${player.playerId}> with **${player.roll}**`;
          if (player.pass) {
            tmpStr = `~~${tmpStr}~~`;
          }

          str += tmpStr;
        }

        fields.push({
          name: " ",
          value: str,
        });
      }
    }

    const prevEmbed = EmbedBuilder.from(message.embeds[0]);
    const newEmbed = prevEmbed.setFields(fields);

    await message.edit({ embeds: [newEmbed] });
  }

  async deleteMessages() {
    for (const [_, message] of this.messages) {
      await message.delete();
    }
  }
}

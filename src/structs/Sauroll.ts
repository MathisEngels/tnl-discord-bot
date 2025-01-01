import { DiscordAPIError, EmbedBuilder, Message, VoiceBasedChannel } from "discord.js";
import SaurollPingEmbed from "../components/sauroll/ping";
import ExtendedClient from "./ExtendedClient";
import { SaurollButtons, SaurollRollEmbed, SaurollRollFields } from "../components/sauroll/roll";
import { SaurollPlayer } from "../types/sauroll";
import { deleteSaurollSubscription, getSaurollSubscribers } from "../api/sauroll";

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

  getPlayers(channel: VoiceBasedChannel) {
    const playerInChannel = channel.members;

    const optIn = this.optInPlayers.get(channel.id) || [];
    const optOut = this.optOutPlayers.get(channel.id) || [];

    const filteredPlayers = playerInChannel.filter((p) => !optOut.includes(p.id)).map((p) => p.id);

    return [...new Set([...filteredPlayers, ...optIn])];
  }

  pass(voiceChannelId: string, playerId: string) {
    this.passPlayers.set(voiceChannelId, [...(this.passPlayers.get(voiceChannelId) || []), playerId]);
    this.updateRoll(voiceChannelId);
  }

  optIn(voiceChannelId: string, playerId: string) {
    if (this.optOutPlayers.get(voiceChannelId)?.includes(playerId)) {
      this.optOutPlayers.set(
        voiceChannelId,
        (this.optOutPlayers.get(voiceChannelId) || []).filter((p) => p !== playerId)
      );
    }

    this.optInPlayers.set(voiceChannelId, [...(this.optInPlayers.get(voiceChannelId) || []), playerId]);
  }

  optOut(voiceChannelId: string, playerId: string) {
    if (this.optInPlayers.get(voiceChannelId)?.includes(playerId)) {
      this.optInPlayers.set(
        voiceChannelId,
        (this.optInPlayers.get(voiceChannelId) || []).filter((p) => p !== playerId)
      );
    }

    this.optOutPlayers.set(voiceChannelId, [...(this.optOutPlayers.get(voiceChannelId) || []), playerId]);
    this.updateRoll(voiceChannelId);
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
    const saurollSubscribers = await getSaurollSubscribers();

    for (const { discordGuildId, discordVoiceChannelId, discordTextChannelId, discordRoleId } of saurollSubscribers) {
      const guild = await this.client.guilds.fetch(discordGuildId);
      const me = await guild.members.fetchMe();
      if (!me.permissionsIn(discordTextChannelId).has("SendMessages") || !me.permissionsIn(discordTextChannelId).has("ViewChannel")) break;

      const textChannel = await this.client.channels.fetch(discordTextChannelId);
      if (!textChannel || !textChannel.isSendable()) break;

      const message = await textChannel.send({ content: `<@&${discordRoleId}>`, embeds: [SaurollPingEmbed(discordVoiceChannelId, discordRoleId)] });

      this.messages.set(discordVoiceChannelId, message);
    }
  }

  async postRoll(chestNumber: number) {
    const saurollSubscribers = await getSaurollSubscribers();

    for (const { discordGuildId, discordVoiceChannelId, discordTextChannelId } of saurollSubscribers) {
      try {
        const guild = await this.client.guilds.fetch(discordGuildId);
        const me = await guild.members.fetchMe();
        if (!me.permissionsIn(discordTextChannelId).has("SendMessages") || !me.permissionsIn(discordTextChannelId).has("ViewChannel")) break;

        const voiceChannel = await this.client.channels.fetch(discordVoiceChannelId);
        if (!voiceChannel || !voiceChannel.isVoiceBased()) break;
        const textChannel = await this.client.channels.fetch(discordTextChannelId);
        if (!textChannel || !textChannel.isSendable()) break;

        const players = this.getPlayers(voiceChannel)
          .map((playerId) => ({ playerId, roll: 1 + Math.floor(Math.random() * 100) }))
          .sort((a, b) => b.roll - a.roll);

        this.players.set(discordVoiceChannelId, players);

        const prevMessage = this.messages.get(discordVoiceChannelId);
        let message;
        if (!prevMessage) {
          message = await textChannel.send({ content: "", embeds: [SaurollRollEmbed(players, chestNumber, discordVoiceChannelId)], components: [SaurollButtons(discordVoiceChannelId)] });
        } else {
          message = await prevMessage.edit({ content: "", embeds: [SaurollRollEmbed(players, chestNumber, discordVoiceChannelId)], components: [SaurollButtons(discordVoiceChannelId)] });
        }
        this.messages.set(discordVoiceChannelId, message);
      } catch (e) {
        const err = e as DiscordAPIError;
        switch (err.code) {
          case 10004: // Unknown Guild
            console.error(`Unknown Guild (${discordGuildId}), deleting subscription`);
            const res = await deleteSaurollSubscription(discordGuildId);
            console.error(`${res ? "Successfully" : "Failed to"} delete the subscription for ${discordGuildId}`);
            break;
          case 10003: // Unknown Channel
            console.error(`Unknown Channel(s) (${discordVoiceChannelId} ; ${discordTextChannelId}), deleting subscription`);
            const resChannel = await deleteSaurollSubscription(discordGuildId);
            console.error(`${resChannel ? "Successfully" : "Failed to"} delete the subscription for ${discordGuildId}`);
            break;
          default:
            console.error(e);
            break;
        }
      }
    }
  }

  async updateRoll(voiceChannelId: string) {
    const message = this.messages.get(voiceChannelId);
    if (!message) {
      console.error("Message not found");
      return;
    }

    const prevPlayers = this.players.get(voiceChannelId) || [];

    const optOutPlayers = this.optOutPlayers.get(voiceChannelId) || [];
    const passPlayers = this.passPlayers.get(voiceChannelId) || [];

    const players = prevPlayers
      ?.filter((p) => !optOutPlayers.includes(p.playerId))
      .map((p) => ({
        ...p,
        pass: passPlayers.includes(p.playerId),
      }));

    const newFields = SaurollRollFields(players);

    const prevEmbed = EmbedBuilder.from(message.embeds[0]);
    const newEmbed = prevEmbed.setFields(newFields);

    await message.edit({ content: "", embeds: [newEmbed] });
  }

  async deleteMessages() {
    for (const [_, message] of this.messages) {
      await message.delete();
    }
  }
}

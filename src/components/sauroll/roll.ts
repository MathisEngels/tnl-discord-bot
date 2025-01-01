import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import dedent from "ts-dedent";
import { SaurollPlayer } from "../../types/sauroll";

export function SaurollRollFields(players: SaurollPlayer[]) {
  const fields = [];
  const chunkSize = 10;
  let displayIndex = 1;

  if (players.length !== 0) {
    for (let i = 0; i < Math.ceil(players.length / chunkSize); i++) {
      if (i !== 0 && i % 2 === 0) {
        fields.push({
          name: "\u200b",
          value: "\u200b",
        });

        continue;
      }

      let str = "";

      for (let j = 0; j < chunkSize && i * chunkSize + j < players.length; j++) {
        const player = players[i * chunkSize + j];
        const tmpStr = player.pass ? `~~<@${player.playerId}> with **${player.roll}**~~` : `\`${displayIndex++}.\` <@${player.playerId}> with **${player.roll}**`;

        str += tmpStr + "\n";
      }

      fields.push({
        name: "\u200b",
        value: str,
        inline: true,
      });
    }
  }

  return fields;
}

export function SaurollRollEmbed(players: SaurollPlayer[], chestNumber: number, voiceChannelId: string) {
  const fields = SaurollRollFields(players);

  return new EmbedBuilder()
    .setColor("#237feb")
    .setTitle(`Sauroll - Chest #${chestNumber}`)
    .setDescription(
      dedent`
    Happy ratting! 🐀

    ***Join <#${voiceChannelId}> to be automatically included in the rolls.**
    __**Pass**__ if you can't make it in time to get the chest.
    __**Opt-in**__ if you can't join <#${voiceChannelId}> but wants to be included in the rolls.
    __**Opt-out**__ if you don't want the chests but are in <#${voiceChannelId}>.*
    `
    )
    .addFields(fields);
}

export function SaurollButtons(voiceChannelId: string) {
  const passButton = new ButtonBuilder().setCustomId(`sauroll-pass-${voiceChannelId}`).setLabel("Pass").setEmoji("⏭️").setStyle(ButtonStyle.Primary);
  const optInButton = new ButtonBuilder().setCustomId(`sauroll-optIn-${voiceChannelId}`).setLabel("Opt-in").setEmoji("🖋️").setStyle(ButtonStyle.Success);
  const optOutButton = new ButtonBuilder().setCustomId(`sauroll-optOut-${voiceChannelId}`).setLabel("Opt-out").setEmoji("🏃‍♂️").setStyle(ButtonStyle.Danger);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(passButton, optInButton, optOutButton);
}

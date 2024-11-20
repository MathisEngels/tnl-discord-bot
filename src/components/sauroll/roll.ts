import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import dedent from "ts-dedent";
import { SaurollPlayer } from "../../types/sauroll";

export function SaurollRollEmbed(players: SaurollPlayer[], chestNumber: number, channelId: string) {
  const fields = [];

  if (players.length !== 0) {
    const chunkSize = 10;

    for (let i = 0; i < Math.ceil(players.length / chunkSize); i++) {
      let str = "";

      for (let j = 0; j < chunkSize; j++) {
        const index = i * chunkSize + j;
        if (index >= players.length) break;

        const player = players[index];
        let tmpStr = `\`${index + 1}.\` <@${player.playerId}> with **${player.roll}**`;
        if (player.pass) {
          tmpStr = `~~${tmpStr}~~`;
        }

        str += tmpStr + "\n";
      }

      fields.push({
        name: " ",
        value: str,
      });
    }
  }

  return new EmbedBuilder()
    .setColor("#237feb")
    .setTitle(`Sauroll - Chest #${chestNumber}`)
    .setDescription(
      dedent`
    Happy ratting! 🐀

    ***Join <#${channelId}> to be automatically included in the rolls.**
    __**Pass**__ if you can't make it in time to get the chest.
    __**Opt-in**__ if you can't join <#${channelId}> but wants to be included in the rolls.
    __**Opt-out**__ if you don't want the chests but are in <#${channelId}>.*
    `
    )
    .addFields(fields);
}

const passButton = new ButtonBuilder().setCustomId(`sauroll-pass`).setLabel("Pass").setEmoji("⏭️").setStyle(ButtonStyle.Primary);
const optInButton = new ButtonBuilder().setCustomId(`sauroll-optIn`).setLabel("Opt-in").setEmoji("🖋️").setStyle(ButtonStyle.Success);
const optOutButton = new ButtonBuilder().setCustomId(`sauroll-optOut`).setLabel("Opt-out").setEmoji("🏃‍♂️").setStyle(ButtonStyle.Danger);
export const saurollButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(passButton, optInButton, optOutButton);

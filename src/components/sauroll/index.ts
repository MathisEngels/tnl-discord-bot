import { ButtonBuilder, ButtonStyle, ActionRowBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder } from "discord.js";
import dedent from "ts-dedent";

const roleSelect = new RoleSelectMenuBuilder().setCustomId("role").setPlaceholder("Select a role").setMinValues(0).setMaxValues(1);
export const roleRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect);

const channelSelect = new ChannelSelectMenuBuilder().setCustomId("channel").setPlaceholder("Select a channel").setChannelTypes(ChannelType.GuildVoice).setMinValues(0).setMaxValues(1);
const createChannel = new ButtonBuilder().setCustomId("createChannel").setLabel("Create a channel").setStyle(ButtonStyle.Primary);
export const channelRows = [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect), new ActionRowBuilder<ButtonBuilder>().addComponents(createChannel)];

export function getConfirmationEmbed(channelId: string) {
  const desc = dedent`
  Sauroll have been set up in <#${channelId}>.
  From now on, Sauroll will output the rolls for Saurodoma's chests in this channel.`;

  const fieldVal = dedent`
  1. Sauroll will send a message in <#${channelId}> whenever night is about to fall.
  2. You can either join the voice channel, and be automatically included in the roll, or you can react to the message to be included.
  3. 1-2 minutes before a chest spawns, Sauroll will send a message in <#${channelId}> to let you know who won.
  5. Optionally, you can pass the roll to someone else by reacting to the message.`;

  return new EmbedBuilder().setTitle("Sauroll").setDescription(desc).addFields({ name: "How does it work?", value: fieldVal }).setFooter({ text: "Opt-out with `/setup sauroll`" });
}
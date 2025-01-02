import { ButtonBuilder, ButtonStyle, ActionRowBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder } from "discord.js";
import dedent from "ts-dedent";

export const subscriptionManagerEmbed = new EmbedBuilder().setTitle("Sauroll").setDescription(
  dedent`
  **What would you like to manage? **
  Add a new subscription, update an existing one, or cancel something that's no longer needed.`
);

const addSubscription = new ButtonBuilder().setCustomId("addSubscription").setLabel("Add").setStyle(ButtonStyle.Success);
const updateSubscription = new ButtonBuilder().setCustomId("updateSubscription").setLabel("Update").setStyle(ButtonStyle.Primary);
const cancelSubscription = new ButtonBuilder().setCustomId("cancelSubscription").setLabel("Cancel").setStyle(ButtonStyle.Danger);

export const subscriptionManagerRow = new ActionRowBuilder<ButtonBuilder>().addComponents(addSubscription, updateSubscription, cancelSubscription);

export function getSubscriptionActionFailEmbed(verb: string, voiceChannelId: string, reason?: string) {
  return new EmbedBuilder().setTitle("Sauroll").setDescription(
    dedent`
    Failed to ${verb} the Sauroll subscription in <#${voiceChannelId}>. 
    Reason: ${reason}.
    Please try again.`
  );
}

export function getSubscriptionActionSuccessEmbed(verb: string, voiceChannelId: string) {
  return new EmbedBuilder().setTitle("Sauroll").setDescription(`Sauroll subscription in <#${voiceChannelId}> has been ${verb}d.`);
}

const voiceChannelSelect = new ChannelSelectMenuBuilder().setCustomId("channel").setPlaceholder("Select a channel").setChannelTypes(ChannelType.GuildVoice).setMinValues(0).setMaxValues(1);
const createChannel = new ButtonBuilder().setCustomId("createChannel").setLabel("Create a channel").setStyle(ButtonStyle.Primary);
export const voiceChannelRows = [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(voiceChannelSelect), new ActionRowBuilder<ButtonBuilder>().addComponents(createChannel)];

const textChannelSelect = new ChannelSelectMenuBuilder()
  .setCustomId("channel")
  .setPlaceholder("Select a channel")
  .setChannelTypes([ChannelType.GuildText, ChannelType.GuildVoice])
  .setMinValues(0)
  .setMaxValues(1);
const sameAsVoiceChannel = new ButtonBuilder().setCustomId("sameAsVoiceChannel").setLabel("Same as voice channel").setStyle(ButtonStyle.Primary);
export const textChannelRows = [
  new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(textChannelSelect),
  new ActionRowBuilder<ButtonBuilder>().addComponents(sameAsVoiceChannel, createChannel),
];

const roleSelect = new RoleSelectMenuBuilder().setCustomId("roleSelect").setPlaceholder("Select a role").setMinValues(0).setMaxValues(1);
const createRole = new ButtonBuilder().setCustomId("createRole").setLabel("Create a role").setStyle(ButtonStyle.Primary);
const skipRole = new ButtonBuilder().setCustomId("skipRole").setLabel("Skip").setStyle(ButtonStyle.Danger);
export const roleRows = [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect), new ActionRowBuilder<ButtonBuilder>().addComponents(createRole, skipRole)];

export function getConfirmationEmbed(voiceChannelId: string, textChannelId: string, roleId?: string, warningText?: string) {
  const desc = dedent`
  Sauroll have been set up in <#${voiceChannelId}>${roleId ? ` for <@&${roleId}>.` : "."}.
  From now on, Sauroll will output the rolls for Saurodoma's chests ${voiceChannelId === textChannelId ? "in this channel." : `in <#${textChannelId}>.`}`;

  const fieldVal = dedent`
  1. Sauroll will send a message in <#${textChannelId}> whenever night is about to fall.
  2. You can either join the voice channel (<#${voiceChannelId}>), and be automatically included in the roll, or you can react to the message to be included.
  3. 1-2 minutes before a chest spawns, Sauroll will send a message in <#${textChannelId}> to let you know who won.
  5. Optionally, you can pass the roll to someone else by reacting to the message.`;

  const fields = [];
  if (warningText) fields.push({ name: "Warning", value: warningText });
  fields.push({ name: "How does it work?", value: fieldVal });

  return new EmbedBuilder().setTitle("Sauroll").setDescription(desc).addFields(fields).setFooter({ text: "Cancel subscription with `/sauroll`" });
}

import {
  BaseGuildVoiceChannel,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  ChannelType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  RoleSelectMenuInteraction,
  SlashCommandBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import {
  voiceChannelRows,
  getConfirmationEmbed,
  roleRows,
  subscriptionManagerEmbed,
  subscriptionManagerRow,
  textChannelRows,
  getSubscriptionActionSuccessEmbed,
  getSubscriptionActionFailEmbed,
} from "../components/sauroll";
import { createSaurollSubscription, deleteSaurollSubscription, getSaurollSubscriptionsByDiscordGuildId, updateSaurollSubscription } from "../api/sauroll";
import stringSelectPagination from "../functions/stringSelectPagination";
import { StringSelectPage } from "../types/pagination";
import mainLogger from "../logger";

const logger = mainLogger.child({ scope: "Command" });

export const data = new SlashCommandBuilder()
  .setName("sauroll")
  .setDescription("Manage Sauroll subscription.")
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
  logger.info("Executing /sauroll command.", { interactionId: interaction.id });

  if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

  const subcriptionManagerMsg = await interaction.followUp({ content: "", embeds: [subscriptionManagerEmbed], components: [subscriptionManagerRow], ephemeral: true });
  const subcriptionManagerAns = await subcriptionManagerMsg.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });
  await subcriptionManagerAns.deferUpdate();

  if (subcriptionManagerAns.customId === "addSubscription") {
    await addSubscription(subcriptionManagerAns);
  } else if (subcriptionManagerAns.customId === "updateSubscription") {
    await updateSubscription(subcriptionManagerAns);
  } else if (subcriptionManagerAns.customId === "cancelSubscription") {
    await cancelSubscription(subcriptionManagerAns);
  }
}

async function addSubscription(interaction: ButtonInteraction) {
  logger.info("Adding a new Sauroll subscription.", { interactionId: interaction.id });

  let voiceChannelPermissionWarning = false;
  let textChannelPermissionWarning = false;

  const voiceChannelMsg = await interaction.editReply({
    embeds: [new EmbedBuilder().setTitle("Sauroll").setDescription("Please select a voice channel for Sauroll.")],
    components: voiceChannelRows,
  });
  const voiceChannelAns = (await voiceChannelMsg.awaitMessageComponent({ time: 60000 })) as ButtonInteraction | ChannelSelectMenuInteraction;
  await voiceChannelAns.deferUpdate();

  let voiceChannelId;

  if (voiceChannelAns.customId === "createChannel") {
    const channel = await interaction.guild!.channels.create({ type: ChannelType.GuildVoice, name: "Sauroll" });
    voiceChannelId = channel.id;
  } else {
    voiceChannelId = (voiceChannelAns as ChannelSelectMenuInteraction).values[0];
    const me = await interaction.guild!.members.fetchMe();
    voiceChannelPermissionWarning = !me.permissionsIn(voiceChannelId).has("SendMessages") || !me.permissionsIn(voiceChannelId).has("ViewChannel");
  }

  logger.debug(`Voice channel selected: ${voiceChannelId}`, { interactionId: interaction.id });

  const textChannelMsg = await voiceChannelAns.editReply({
    content: "",
    embeds: [new EmbedBuilder().setTitle("Sauroll").setDescription("Please select a text channel for Sauroll.")],
    components: textChannelRows,
  });
  const textChannelAns = (await textChannelMsg.awaitMessageComponent({ time: 60000 })) as ButtonInteraction | ChannelSelectMenuInteraction;
  await textChannelAns.deferUpdate();

  let textChannelId;

  if (textChannelAns.customId === "createChannel") {
    const channel = await interaction.guild!.channels.create({ type: ChannelType.GuildText, name: "Sauroll" });
    textChannelId = channel.id;
  } else if (textChannelAns.customId === "sameAsVoiceChannel") {
    textChannelId = voiceChannelId;
  } else {
    textChannelId = (textChannelAns as ChannelSelectMenuInteraction).values[0];
    const me = await interaction.guild!.members.fetchMe();
    textChannelPermissionWarning = !me.permissionsIn(textChannelId).has("SendMessages") || !me.permissionsIn(textChannelId).has("ViewChannel");
  }

  logger.debug(`Text channel selected: ${textChannelId}`, { interactionId: interaction.id });

  const roleMsg = await textChannelAns.editReply({ content: "Please select a role for Sauroll.", components: roleRows });
  const roleAns = (await roleMsg.awaitMessageComponent({ time: 60000 })) as ButtonInteraction | RoleSelectMenuInteraction;
  await roleAns.deferUpdate();

  let roleId;
  if (roleAns.customId === "createRole") {
    const role = await interaction.guild!.roles.create({ name: "Sauroll" });
    roleId = role.id;
  } else if (roleAns.customId === "roleSelect") {
    roleId = (roleAns as RoleSelectMenuInteraction).values[0];
  }

  logger.debug(`Role selected: ${roleId}`, { interactionId: interaction.id });

  const res = await createSaurollSubscription({
    discordGuildId: interaction.guildId!,
    discordVoiceChannelId: voiceChannelId,
    discordTextChannelId: textChannelId,
    discordRoleId: roleId,
  });
  if (!res) {
    logger.warn("Failed to create the Sauroll subscription.", { interactionId: interaction.id });

    await roleAns.editReply({ content: "", embeds: [new EmbedBuilder().setTitle("Sauroll").setDescription("Failed to create the Sauroll subscription.")], components: [] });
    return;
  }

  let warningMsg = "";
  warningMsg += voiceChannelPermissionWarning
    ? `⚠️ I don't have **ACCESS** to <#${voiceChannelId}> or **PERMISSIONS** to send messages or view <#${voiceChannelId}>. Manually fix it, or grant me Administrator rights. ⚠️`
    : "";
  warningMsg += textChannelPermissionWarning
    ? `⚠️ I don't have **ACCESS** to <#${textChannelId}> or **PERMISSIONS** to send messages or view <#${textChannelId}>. Manually fix it, or grant me Administrator rights. ⚠️`
    : "";

  logger.debug(`Permission warning: ${warningMsg}`, { interactionId: interaction.id });

  await roleAns.editReply({ content: warningMsg, embeds: [getConfirmationEmbed(voiceChannelId, textChannelId, roleId)], components: [] });

  logger.info("Sauroll subscription created.", { interactionId: interaction.id });
  return;
}

async function updateSubscription(interaction: ButtonInteraction) {
  logger.info("Updating a Sauroll subscription.", { interactionId: interaction.id });

  const subscriptions = await getSaurollSubscriptionsByDiscordGuildId(interaction.guildId!);

  if (subscriptions.length === 0) {
    logger.info("No Sauroll subscription to update.", { interactionId: interaction.id });

    await interaction.editReply({ content: "", embeds: [new EmbedBuilder().setTitle("Sauroll").setDescription("There is no Sauroll subscription to update.")], components: [] });
    return;
  }

  const subscriptionsPages = await subscriptions.reduce(async (accPromise, sub, i) => {
    const acc = await accPromise;
    const pageIndex = Math.floor(i / 25);
    if (!acc[pageIndex]) acc[pageIndex] = [];

    const voiceChannel = (await interaction.client.channels.fetch(sub.discordVoiceChannelId)) as BaseGuildVoiceChannel;
    acc[pageIndex].push({
      label: `${voiceChannel.name}`,
      description: `ID: ${sub.discordVoiceChannelId}`,
      value: sub.discordVoiceChannelId,
    });

    return acc;
  }, Promise.resolve([] as StringSelectPage[]));

  const callback = async (i: StringSelectMenuInteraction) => {
    const subscription = subscriptions.find((sub) => sub.discordVoiceChannelId === i.values[0])!;

    let textChannelPermissionWarning = false;

    const textChannelMsg = await i.editReply({
      content: "",
      embeds: [new EmbedBuilder().setTitle("Sauroll").setDescription("Please select a text channel for Sauroll.")],
      components: textChannelRows,
    });

    const textChannelAns = (await textChannelMsg.awaitMessageComponent({ time: 60000 })) as ButtonInteraction | ChannelSelectMenuInteraction;
    await textChannelAns.deferUpdate();

    let textChannelId;

    if (textChannelAns.customId === "createChannel") {
      await textChannelAns.editReply({ content: "Creating a channel...", components: [] });
      const channel = await interaction.guild!.channels.create({ type: ChannelType.GuildText, name: "Sauroll" });
      textChannelId = channel.id;
    } else if (textChannelAns.customId === "sameAsVoiceChannel") {
      textChannelId = subscription.discordVoiceChannelId;
    } else {
      textChannelId = (textChannelAns as ChannelSelectMenuInteraction).values[0];
      const me = await interaction.guild!.members.fetchMe();
      textChannelPermissionWarning = !me.permissionsIn(textChannelId).has("SendMessages") || !me.permissionsIn(textChannelId).has("ViewChannel");
    }

    logger.debug(`Text channel selected: ${textChannelId}`, { interactionId: i.id });

    const roleMsg = await textChannelAns.editReply({ content: "", embeds: [new EmbedBuilder().setTitle("Sauroll").setDescription("Please select a role for Sauroll.")], components: roleRows });
    const roleAns = (await roleMsg.awaitMessageComponent({ time: 60000 })) as ButtonInteraction | RoleSelectMenuInteraction;
    await roleAns.deferUpdate();

    let roleId;
    if (roleAns.customId === "createRole") {
      await roleAns.editReply({ content: "Creating a role...", components: [] });
      const role = await interaction.guild!.roles.create({ name: "Sauroll" });
      roleId = role.id;
    } else if (roleAns.customId === "roleSelect") {
      roleId = (roleAns as RoleSelectMenuInteraction).values[0];
    }

    logger.debug(`Role selected: ${roleId}`, { interactionId: i.id });

    const res = await updateSaurollSubscription(subscription.discordVoiceChannelId, {
      discordTextChannelId: textChannelId,
      discordRoleId: roleId,
    });

    if (res && res.error) {
      logger.warn("Failed to update the Sauroll subscription.", { interactionId: i.id });
      await i.editReply({ content: "", embeds: [getSubscriptionActionFailEmbed("update", subscription.discordVoiceChannelId, res.error)], components: [] });
      return;
    }

    logger.info("Sauroll subscription updated.", { interactionId: i.id });

    await i.editReply({ content: "", embeds: [getSubscriptionActionSuccessEmbed("update", subscription.discordVoiceChannelId)], components: [] });
    return;
  };

  await stringSelectPagination(interaction, subscriptionsPages, callback, { placeholder: "Select a subscription to update." });
}

async function cancelSubscription(interaction: ButtonInteraction) {
  logger.info("Cancelling a Sauroll subscription.", { interactionId: interaction.id });

  const subscriptions = await getSaurollSubscriptionsByDiscordGuildId(interaction.guildId!);

  if (subscriptions.length === 0) {
    logger.info("No Sauroll subscription to cancel.", { interactionId: interaction.id });

    await interaction.editReply({ content: "", embeds: [new EmbedBuilder().setTitle("Sauroll").setDescription("There is no Sauroll subscription to cancel.")], components: [] });
    return;
  }

  const subscriptionsPages = await subscriptions.reduce(async (accPromise, sub, i) => {
    const acc = await accPromise;
    const pageIndex = Math.floor(i / 25);
    if (!acc[pageIndex]) acc[pageIndex] = [];

    const voiceChannel = (await interaction.client.channels.fetch(sub.discordVoiceChannelId)) as BaseGuildVoiceChannel;
    acc[pageIndex].push({
      label: `${voiceChannel.name}`,
      description: `ID: ${sub.discordVoiceChannelId}`,
      value: sub.discordVoiceChannelId,
    });

    return acc;
  }, Promise.resolve([] as StringSelectPage[]));

  const callback = async (i: StringSelectMenuInteraction) => {
    const voiceChannelId = subscriptions.find((sub) => sub.discordVoiceChannelId === i.values[0])!.discordVoiceChannelId;

    const res = await deleteSaurollSubscription(voiceChannelId);

    if (res && res.error) {
      logger.warn("Failed to cancel the Sauroll subscription.", { interactionId: i.id });

      await i.editReply({ content: "", embeds: [getSubscriptionActionFailEmbed("cancel", voiceChannelId, res.error)], components: [] });
      return;
    }

    logger.info("Sauroll subscription cancelled.", { interactionId: i.id });
    await i.editReply({ content: "", embeds: [getSubscriptionActionSuccessEmbed("cancel", voiceChannelId)], components: [] });
    return;
  };

  await stringSelectPagination(interaction, subscriptionsPages, callback, { placeholder: "Select a subscription to cancel." });
}

export default {
  data,
  execute,
};

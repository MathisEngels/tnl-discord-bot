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

export const data = new SlashCommandBuilder()
  .setName("sauroll")
  .setDescription("Manage Sauroll subscription.")
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
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

  const res = await createSaurollSubscription({
    discordGuildId: interaction.guildId!,
    discordVoiceChannelId: voiceChannelId,
    discordTextChannelId: textChannelId,
    discordRoleId: roleId,
  });
  if (!res) {
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

  await roleAns.editReply({ content: warningMsg, embeds: [getConfirmationEmbed(voiceChannelId, textChannelId, roleId)], components: [] });
  return;
}

async function updateSubscription(interaction: ButtonInteraction) {
  const subscriptions = await getSaurollSubscriptionsByDiscordGuildId(interaction.guildId!);

  if (subscriptions.length === 0) {
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

    const res = await updateSaurollSubscription(subscription.discordVoiceChannelId, {
      discordTextChannelId: textChannelId,
      discordRoleId: roleId,
    });
    if (!res) {
      await i.editReply({ content: "", embeds: [getSubscriptionActionFailEmbed("update", subscription.discordVoiceChannelId)], components: [] });
      return;
    }

    await i.editReply({ content: "", embeds: [getSubscriptionActionSuccessEmbed("update", subscription.discordVoiceChannelId)], components: [] });
    return;
  };

  await stringSelectPagination(interaction, subscriptionsPages, callback, { placeholder: "Select a subscription to update." });
}

async function cancelSubscription(interaction: ButtonInteraction) {
  const subscriptions = await getSaurollSubscriptionsByDiscordGuildId(interaction.guildId!);

  if (subscriptions.length === 0) {
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
    if (!res) {
      await i.editReply({ content: "", embeds: [getSubscriptionActionFailEmbed("cancel", voiceChannelId)], components: [] });
      return;
    }

    await i.editReply({ content: "", embeds: [getSubscriptionActionSuccessEmbed("cancel", voiceChannelId)], components: [] });
    return;
  };

  await stringSelectPagination(interaction, subscriptionsPages, callback, { placeholder: "Select a subscription to cancel." });
}

export default {
  data,
  execute,
};

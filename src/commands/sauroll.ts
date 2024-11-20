import { ButtonInteraction, ChannelSelectMenuInteraction, ChannelType, CommandInteraction, ComponentType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { getGuildByDiscordId, updateGuild } from "../api/guild";
import { channelRows, getConfirmationEmbed, roleRow } from "../components/sauroll";
import { yesNoButtonRow } from "../components/common";

const data = new SlashCommandBuilder().setName("sauroll").setDescription("Setup Sauroll. (Saurodoma rolls)").setContexts(InteractionContextType.Guild);

async function execute(interaction: CommandInteraction) {
  if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

  const guild = await getGuildByDiscordId(interaction.guild!.id);
  if (!guild) {
    await interaction.editReply("This server is not registered in the database. Please run `/setup` first.");
    return;
  }

  if (interaction.user.id !== guild.discordLeaderId && !guild.discordAdvisorIds.includes(interaction.user.id)) {
    await interaction.editReply("Only the guild leader and advisors can invite someone.");
    return;
  }

  const setupRes = await interaction.followUp({ content: "Do you want to use Sauroll? (Saurodoma rolls)", components: [yesNoButtonRow], ephemeral: true });

  const setupConfirmation = await setupRes.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });
  await setupConfirmation.deferUpdate();

  if (setupConfirmation.customId === "no") {
    const success = await updateGuild(guild.id, { discordSaurollRoleId: null, discordSaurollChannelId: null });
    if (!success) {
      await setupConfirmation.editReply({ content: "Failed to update the guild.", components: [] });
      return;
    }

    await setupConfirmation.editReply({ content: "You opt-out of Sauroll.", components: [] });
    return setupConfirmation;
  }

  const channelRes = await setupConfirmation.editReply({ content: "Please select a channel for Sauroll.", components: channelRows });
  const channelConf = (await channelRes.awaitMessageComponent({ time: 60000 })) as ButtonInteraction | ChannelSelectMenuInteraction;
  await channelConf.deferUpdate();

  let discordSaurollChannelId;
  if (channelConf.customId === "createChannel") {
    await setupConfirmation.editReply({ content: "Creating a channel...", components: [] });
    const channel = await interaction.guild!.channels.create({ type: ChannelType.GuildVoice, name: "Sauroll" });

    discordSaurollChannelId = channel.id;
  } else {
    discordSaurollChannelId = (channelConf as ChannelSelectMenuInteraction).values[0];
  }

  const roleRes = await channelConf.editReply({ content: "Please select a role for Sauroll.", components: [roleRow] });
  const roleConf = await roleRes.awaitMessageComponent({ componentType: ComponentType.RoleSelect, time: 60000 });
  await roleConf.deferUpdate();

  const discordSaurollRoleId = roleConf.values[0];

  const success = await updateGuild(guild.id, { discordSaurollChannelId, discordSaurollRoleId });
  if (!success) {
    await roleConf.editReply({ content: "Failed to update the guild.", components: [] });
    return;
  }

  const selectedChannel = (await interaction.guild!.channels.fetch()).get(discordSaurollChannelId)!;
  await setupConfirmation.editReply({ embeds: [getConfirmationEmbed(selectedChannel.id)], components: [] });

  return setupConfirmation;
}

export default {
  data,
  execute,
};

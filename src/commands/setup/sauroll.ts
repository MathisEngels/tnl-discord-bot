import { ButtonInteraction, ChannelSelectMenuInteraction, ChannelType, CommandInteraction, ComponentType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { channelRows, getConfirmationEmbed, roleRow } from "../../components/sauroll";
import { yesNoButtonRow } from "../../components/common";
import { createSaurollSubscription, deleteSaurollSubscription, getSaurollSubscription, updateSaurollSubscription } from "../../api/sauroll";

export default async function setupSauroll(interaction: CommandInteraction) {
  if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

  const subscription = await getSaurollSubscription(interaction.guildId!);

  const setupRes = await interaction.followUp({ content: "Do you want to use Sauroll? (Saurodoma rolls)", components: [yesNoButtonRow], ephemeral: true });

  const setupConfirmation = await setupRes.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });
  await setupConfirmation.deferUpdate();

  if (setupConfirmation.customId === "no") {
    if (subscription) {
      const success = await deleteSaurollSubscription(interaction.guildId!);

      if (!success) {
        await setupConfirmation.editReply({ content: "Failed to update the Sauroll subscription.", components: [] });
        return;
      }
    }

    await setupConfirmation.editReply({ content: "You opt-out of Sauroll.", components: [] });
    return setupConfirmation;
  }

  const channelRes = await setupConfirmation.editReply({ content: "Please select a channel for Sauroll.", components: channelRows });
  const channelConf = (await channelRes.awaitMessageComponent({ time: 60000 })) as ButtonInteraction | ChannelSelectMenuInteraction;
  await channelConf.deferUpdate();

  let discordChannelId;
  if (channelConf.customId === "createChannel") {
    await setupConfirmation.editReply({ content: "Creating a channel...", components: [] });
    const channel = await interaction.guild!.channels.create({ type: ChannelType.GuildVoice, name: "Sauroll" });

    discordChannelId = channel.id;
  } else {
    discordChannelId = (channelConf as ChannelSelectMenuInteraction).values[0];
  }

  const roleRes = await channelConf.editReply({ content: "Please select a role for Sauroll.", components: [roleRow] });
  const roleConf = await roleRes.awaitMessageComponent({ componentType: ComponentType.RoleSelect, time: 60000 });
  await roleConf.deferUpdate();

  const discordRoleId = roleConf.values[0];

  if (subscription) {
    const success = await updateSaurollSubscription(interaction.guildId!, { discordChannelId, discordRoleId });
    if (!success) {
      await roleConf.editReply({ content: "Failed to update the Sauroll subscription.", components: [] });
      return;
    }
  } else {
    const success = await createSaurollSubscription({ discordGuildId: interaction.guildId!, discordChannelId, discordRoleId });
    if (!success) {
      await roleConf.editReply({ content: "Failed to create the Sauroll subscription.", components: [] });
      return;
    }
  }

  const selectedChannel = (await interaction.guild!.channels.fetch()).get(discordChannelId)!;
  await setupConfirmation.editReply({ content: "", embeds: [getConfirmationEmbed(selectedChannel.id)], components: [] });

  return setupConfirmation;
}

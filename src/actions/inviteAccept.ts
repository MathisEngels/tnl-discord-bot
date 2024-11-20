import { ButtonInteraction, ComponentType } from "discord.js";
import { createPlayer, getPlayerByDiscordId, updatePlayer } from "../api/player";
import { getGuildByDiscordId } from "../api/guild";
import { inviteClassRow, inviteConfirmRow, invitePlayerNameModal, inviteRoleRow } from "../components/invite/accept";

export default async function inviteAccept(interaction: ButtonInteraction, discordGuildId: string) {
  const guild = await getGuildByDiscordId(discordGuildId);
  if (!guild) {
    return interaction.editReply({ content: "This guild does not exist!", components: [] });
  }

  const player = await getPlayerByDiscordId(interaction.user.id);

  if (!player) {
    // Player's name & CP
    await interaction.showModal(invitePlayerNameModal);

    const modalVal = await interaction.awaitModalSubmit({ time: 60000 });
    await modalVal.deferUpdate();

    const playerName = modalVal.fields.getField("playerNameInput").value;
    const playerCp = Number(modalVal.fields.getField("playerCpInput").value);
    if (isNaN(playerCp)) {
      return interaction.editReply({ content: "Please enter a valid CP! Aborted", components: [] });
    }

    // Role
    const roleRes = await modalVal.editReply({ content: generateSummaryText("Please select your role", playerName, playerCp), components: [inviteRoleRow] });
    const roleVal = await roleRes.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });
    await roleVal.deferUpdate();

    // Class
    const classRes = await roleVal.editReply({ content: generateSummaryText("Please select your class", playerName, playerCp, roleVal.customId), components: [inviteClassRow] });
    const classVal = await classRes.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });
    await classVal.deferUpdate();

    // Confirm
    const confirmRes = await classVal.editReply({
      content: generateSummaryText("Please confirm your details", playerName, playerCp, roleVal.customId, classVal.customId),
      components: [inviteConfirmRow],
    });
    const confirmVal = await confirmRes.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });
    await confirmVal.deferUpdate();

    if (confirmVal.customId === "cancel") {
      return confirmVal.editReply({ content: "Aborted", components: [] });
    }

    const body = {
      name: playerName,
      discordId: interaction.user.id,
      cp: playerCp,
      role: roleVal.customId,
      class: classVal.customId === "none" ? undefined : classVal.customId,
      guildId: guild.id,
      serverId: guild.serverId,
    };

    const success = await createPlayer(body);
    if (!success) {
      return confirmVal.editReply({ content: "Failed to create your character!", components: [] });
    }

    await confirmVal.editReply({ content: "Your character was saved!", components: [] });
  } else {
    await updatePlayer(player.discordId, { guildId: Number(discordGuildId) });
  }
  
  await interaction.deferUpdate();
  return interaction.editReply({ content: `You have joined the ${guild.name}!`, components: [] });
}

function generateSummaryText(endText: string, name?: string, cp?: number, role?: string, clazz?: string) {
  let text = "";

  if (name) {
    text += `**Name:** ${name}\n`;
  }
  if (cp) {
    text += `**CP:** ${cp}\n`;
  }
  if (role) {
    text += `**Role:** ${role}\n`;
  }
  if (clazz) {
    text += `**Class:** ${clazz}\n`;
  }

  return `${text}\n${endText}`;
}

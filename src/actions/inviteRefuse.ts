import { ButtonInteraction } from "discord.js";

export default async function inviteRefuse(interaction: ButtonInteraction) {
  await interaction.deferReply();
  return interaction.editReply({ content: "Invite refused!", components: [] });
}
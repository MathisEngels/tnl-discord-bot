import { CommandInteraction, ComponentType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { getGuildByDiscordId } from "../api/guild";
import inviteUser from "../actions/inviteUser";
import { inviteUsersRow } from "../components/invite";

const data = new SlashCommandBuilder().setName("invite").setDescription("Invite user(s) to your guild").setContexts(InteractionContextType.Guild);

async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guild = await getGuildByDiscordId(interaction.guild!.id);
  if (!guild) {
    return interaction.editReply("This server is not registered in the database. Please run `/setup` first.");
  }

  if (interaction.user.id !== guild.discordLeaderId && !guild.discordAdvisorIds.includes(interaction.user.id)) {
    return interaction.editReply("Only the guild leader and advisors can invite someone.");
  }

  const res = await interaction.editReply({ content: "Select a user(s) to invite.", components: [inviteUsersRow] });
  const invites = await res.awaitMessageComponent({ componentType: ComponentType.UserSelect, time: 180_000 });
  await invites.deferUpdate();

  for (const user of invites.values) {
    await inviteUser(interaction.client, user, interaction.guild!);
  }

  return interaction.editReply({ content: `${invites.values.length} invites sent!`, components: [] });
}

export default {
  data,
  execute,
};

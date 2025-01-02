import { CommandInteraction, ComponentType, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getGuildByDiscordId } from "../api/guild";
import inviteUser from "../actions/inviteUser";
import { inviteUsersRow } from "../components/invite";
import mainLogger from "../logger";

const logger = mainLogger.child({ scope: "Command" });

const data = new SlashCommandBuilder()
  .setName("invite")
  .setDescription("Invite user(s) to your guild")
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function execute(interaction: CommandInteraction) {
  logger.info("Executing '/invite' command.", { interactionId: interaction.id });

  await interaction.deferReply({ ephemeral: true });

  const guild = await getGuildByDiscordId(interaction.guild!.id);
  if (!guild) {
    logger.debug("Guild not found in the database.", { interactionId: interaction.id });

    return interaction.editReply("This server is not registered in the database. Please run `/setup` first.");
  }
  logger.debug("Guild found in the database.", { interactionId: interaction.id });

  const res = await interaction.editReply({ content: "Select a user(s) to invite.", components: [inviteUsersRow] });
  const invites = await res.awaitMessageComponent({ componentType: ComponentType.UserSelect, time: 180_000 });
  await invites.deferUpdate();

  logger.debug(`${invites.values.length} users selected.`, { interactionId: interaction.id });

  for (const user of invites.values) {
    logger.debug(`Sending invite to user ${user}.`, { interactionId: interaction.id });
    await inviteUser(interaction.client, user, interaction.guild!);
  }

  logger.info("Invites sent.", { interactionId: interaction.id });
  return interaction.editReply({ content: `${invites.values.length} invites sent!`, components: [] });
}

export default {
  data,
  execute,
};

import { ChatInputCommandInteraction, CommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import setupAll from "./all";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Commands to setup the bot.")
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) => subcommand.setName("all").setDescription("Run the whole setup wizard for this bot."));

export async function execute(interaction: CommandInteraction) {
  const subCommand = (interaction as ChatInputCommandInteraction).options.getSubcommand();

  if (subCommand === "all") {
    await setupAll(interaction);
  }
}

export default { data, execute };

import { REST, Routes } from "discord.js";
import commands from "./commands";
import { config } from "./config";
import logger from "./logger";

const rest = new REST().setToken(config.DISCORD_TOKEN);

const commandsData = Object.values(commands).map((command) => command.data.toJSON());

(async () => {
  try {
    logger.info(`DEV - Started refreshing ${commandsData.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, process.env.GUILD_ID!), { body: commandsData });

    logger.info(`DEV - Successfully reloaded ${(data as string[]).length} application (/) commands.`);
  } catch (error) {
    logger.error(`DEV - Failed to reload application (/) commands:`, error);
  }
})();

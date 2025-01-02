import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import commands from "./commands";
import logger from "./logger";

dotenv.config();

const rest = new REST().setToken(process.env.PROD_DISCORD_TOKEN!);

const commandsData = Object.values(commands).map((command) => command.data.toJSON());

(async () => {
  try {
    logger.info(`PROD - Started refreshing ${commandsData.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationCommands(process.env.PROD_DISCORD_CLIENT_ID!), { body: commandsData });

    logger.info(`PROD - Successfully reloaded ${(data as string[]).length} application (/) commands.`);
  } catch (error) {
    logger.error(`PROD - Failed to reload application (/) commands:`, error);
  }
})();

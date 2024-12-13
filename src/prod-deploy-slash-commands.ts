import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import commands from "./commands";

dotenv.config();

const rest = new REST().setToken(process.env.PROD_DISCORD_TOKEN!);

const commandsData = Object.values(commands).map((command) => command.data.toJSON());

(async () => {
  try {
    console.log(`PROD - Started refreshing ${commandsData.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationCommands(process.env.PROD_DISCORD_CLIENT_ID!), { body: commandsData });

    console.log(`PROD - Successfully reloaded ${(data as string[]).length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

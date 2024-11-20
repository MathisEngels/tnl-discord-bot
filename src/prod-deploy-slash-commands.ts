import { REST, Routes } from "discord.js";
import commands from "./commands";
import { config } from "./config";

const rest = new REST().setToken(config.DISCORD_TOKEN);

const commandsData = Object.values(commands).map((command) => command.data.toJSON());

(async () => {
  try {
    console.log(`PROD - Started refreshing ${commandsData.length} application (/) commands.`);
    console.log(commandsData);

    const data = await rest.put(Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, process.env.GUILD_ID!), { body: commandsData });
    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body: commandsData });

    console.log(`PROD - Successfully reloaded ${(data as string[]).length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

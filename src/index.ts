import { Events, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import ExtendedClient from "./structs/ExtendedClient.js";
import logger from "./logger.js";

logger.info(`Starting up in ${process.env.NODE_ENV ?? 'dev'} mode...`);

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates];

const client = new ExtendedClient({ intents });

client.once(Events.ClientReady, (readyClient) => {
  client.setSaurollHandlers();

  logger.info(`Client ready! Logged in as ${readyClient.user.tag}`);
});

logger.info("Logging in...");
client.login(config.DISCORD_TOKEN);

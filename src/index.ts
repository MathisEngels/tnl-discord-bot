import { Events, GatewayIntentBits } from "discord.js";

import { config } from "./config.js";
import ExtendedClient from "./structs/ExtendedClient.js";

const client = new ExtendedClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates] });

client.once(Events.ClientReady, (readyClient) => {
  client.setSaurollHandlers();

  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(config.DISCORD_TOKEN);

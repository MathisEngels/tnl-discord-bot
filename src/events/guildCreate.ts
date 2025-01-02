import { AuditLogEvent, Events, Guild } from "discord.js";
import { TEventListener } from "../types/events";
import dedent from "ts-dedent";
import logger from "../logger";

const listener: TEventListener<Events.GuildCreate> = {
  name: Events.GuildCreate,
  once: false,
  execute: async (guild: Guild) => {
    logger.debug(`Event: GuildCreate (${guild.name} [${guild.id}]).`);

    const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 });
    const adder = logs.entries.first()?.executor;

    let sendTo;
    if (!adder) {
      sendTo = (await guild.fetchOwner())!.user;
    } else {
      sendTo = await adder.fetch();
    }

    const message = dedent`
    # :wave: Thanks for inviting me to ${guild.name}!
    
    To get started, use \`/setup all\` on your server if you want the full wizard installation.
    If you only want Sauroll (Saurodoma rolls) to be enabled, use \`/setup sauroll\`.`;

    await sendTo.send({ content: message });

    logger.info(`Sent welcome message to ${sendTo.tag} (${sendTo.id}) in ${guild.name} [${guild.id}]`);
  },
};

export default listener;

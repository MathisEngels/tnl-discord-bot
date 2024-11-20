import { EmbedBuilder } from "discord.js";
import dedent from "ts-dedent";

function SaurollPingEmbed(channelId: string, roleId?: string) {
  return new EmbedBuilder().setColor("#237feb").setTitle("Sauroll").setDescription(dedent`
      Hey ${roleId? `<@&${roleId}>`: '!'}
      Night is about to fall, join <#${channelId}>, to be automatically included in the rolls.
      Happy ratting! 🐀
`);
}

export default SaurollPingEmbed;

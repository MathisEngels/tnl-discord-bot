import { dedent } from "ts-dedent";
import { Client, Guild } from "discord.js";
import { getGuildByDiscordId } from "../api/guild";
import { getInviteUserRow } from "../components/invite";

export default async function inviteUser(client: Client, userId: string, discordGuild: Guild) {
  const guild = await getGuildByDiscordId(discordGuild.id);
  if (!guild) return;
  
  const user = await client.users.fetch(userId);
  const message = await user.send({
    content: dedent`
    Hey! Sorry to bother you, but you've been invited to join ${guild.name} guild. Do you accept the invitation?
  `,
    components: [getInviteUserRow(discordGuild)],
  });

  setTimeout(() => {
    message.delete();
  }, 1000 * 60 * 60 * 24);
}

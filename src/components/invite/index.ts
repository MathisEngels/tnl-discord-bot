import { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild } from "discord.js";

const inviteUsers = new UserSelectMenuBuilder().setCustomId("inviteUsers").setPlaceholder("Select a user(s) to invite").setMaxValues(25);
export const inviteUsersRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(inviteUsers);

export function getInviteUserRow(discordGuild: Guild) {
  const acceptButton = new ButtonBuilder().setCustomId(`guildInvite-accept-${discordGuild.id}`).setLabel("Accept").setStyle(ButtonStyle.Success);
  const rejectButton = new ButtonBuilder().setCustomId(`guildInvite-refuse-${discordGuild.id}`).setLabel("Refuse").setStyle(ButtonStyle.Danger);
  const inviteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, rejectButton);

  return inviteRow;
}

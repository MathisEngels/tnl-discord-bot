import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from "discord.js";
import { Region, Server } from "../../types/API";

const regionSelect = new StringSelectMenuBuilder().setCustomId("region").setPlaceholder("Select a region");
const regionSelectActionRow = new ActionRowBuilder<StringSelectMenuBuilder>();

export function getRegionSelectRow(regions: Region[]) {
  if (regionSelect.options.length) return regionSelectActionRow;

  const regionsOptions = regions.map((region) => new StringSelectMenuOptionBuilder().setLabel(region.name).setDescription(`${region.shortname} region`).setValue(region.id.toString()));
  regionSelect.setOptions(regionsOptions);
  regionSelectActionRow.addComponents(regionSelect);

  return regionSelectActionRow;
}

export function getServerSelectRow(servers: Server[], id?: string | number) {
  const serversOptions = servers.map((server) => new StringSelectMenuOptionBuilder().setLabel(server.name).setValue(server.id.toString()));
  const serverSelect = new StringSelectMenuBuilder()
    .setCustomId(`server${id ? `-${id}` : ""}`)
    .setPlaceholder(`Select a server ${id ? ` | Page ${id}` : ""}`)
    .setOptions(serversOptions);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(serverSelect);
}

const guildNameInput = new TextInputBuilder().setCustomId("guildNameInput").setLabel("What is your guild's name?").setStyle(TextInputStyle.Short);
const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents(guildNameInput);
export const guildSetupModal = new ModalBuilder().setCustomId("guildNameModal").setTitle("Guild Setup").addComponents(modalRow);

const guildLeaderSelect = new UserSelectMenuBuilder().setCustomId("guildLeader").setPlaceholder("Select the guild leader");
export const guildLeaderRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(guildLeaderSelect);

const guildAdvisorSelect = new UserSelectMenuBuilder().setCustomId("guildAdvisor").setPlaceholder("Select the guild advisor(s) (if any)").setMinValues(0).setMaxValues(3);
export const guildAdvisorRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(guildAdvisorSelect);

const membersRoleSelect = new RoleSelectMenuBuilder().setCustomId("membersRole").setPlaceholder("Select the members role");
export const membersRoleRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(membersRoleSelect);

const confirmButton = new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success);
const cancelButton = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);
export const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

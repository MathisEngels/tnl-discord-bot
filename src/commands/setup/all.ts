import { CommandInteraction, ComponentType, Role, User } from "discord.js";
import { getAllRegions, getServersByRegionId } from "../../api/region";
import { createGuild, getGuildByDiscordId, updateGuild } from "../../api/guild";
import { confirmRow, getRegionSelectRow, getServerSelectRow, guildAdvisorRow, guildLeaderRow, guildSetupModal, membersRoleRow } from "../../components/setup";
import { Region, Server } from "../../types/API";
import mainLogger from "../../logger";

const logger = mainLogger.child({ scope: "Command" });

let regions: Region[] | undefined;
let servers = new Map<string, Server[]>();

export default async function setupAll(interaction: CommandInteraction) {
  logger.info("Executing '/setup all' command.", { interactionId: interaction.id });

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild!;

  if (!regions) {
    regions = await getAllRegions();
  }

  const regionSelectRow = getRegionSelectRow(regions);
  const regionRes = await interaction.editReply({ content: generateSummaryText("Please select the **region** of your guild!"), components: [regionSelectRow] });

  try {
    const regionConfirmation = await regionRes.awaitMessageComponent({ componentType: ComponentType.StringSelect, time: 60000 });
    await regionConfirmation.deferUpdate();

    const regionName = regions.find((region) => region.id === parseInt(regionConfirmation.values[0]))!.name;
    logger.debug(`Region selected: ${regionName}`, { interactionId: interaction.id });

    if (!servers.has(regionName)) {
      const serverList = await getServersByRegionId(regionConfirmation.values[0]);
      serverList.sort((a, b) => a.name.localeCompare(b.name));
      servers.set(regionName, serverList);
    }

    let serverSelectRows;
    if (servers.get(regionName)!.length > 25) {
      serverSelectRows = [getServerSelectRow(servers.get(regionName)!.slice(0, 25), 1), getServerSelectRow(servers.get(regionName)!.slice(25), 2)];
    } else {
      serverSelectRows = [getServerSelectRow(servers.get(regionName)!)];
    }

    const serverRes = await regionConfirmation.editReply({
      content: generateSummaryText("Please select the **server** of your guild!", regionName),
      components: serverSelectRows,
    });
    const serverConfirmation = await serverRes.awaitMessageComponent({ componentType: ComponentType.StringSelect, time: 60000 });

    const serverName = servers.get(regionName)!.find((server) => server.id === parseInt(serverConfirmation.values[0]))!.name;
    logger.debug(`Server selected: ${serverName}`, { interactionId: interaction.id });

    // Guild's name modal
    await serverConfirmation.showModal(guildSetupModal);
    await serverConfirmation.editReply({ content: generateSummaryText("Please enter the **name** of your guild!", regionName, serverName), components: [] });

    const modalRes = await serverConfirmation.awaitModalSubmit({ time: 60000 });
    await modalRes.deferUpdate();

    const guildName = modalRes.fields.getField("guildNameInput").value;
    logger.debug(`Guild name: ${guildName}`, { interactionId: interaction.id });

    // Guild's leader
    const guildLeaderRes = await serverConfirmation.editReply({
      content: generateSummaryText("Please select the **leader** of your guild!", regionName, serverName, guildName),
      components: [guildLeaderRow],
    });

    const guildLeaderConfirmation = await guildLeaderRes.awaitMessageComponent({ componentType: ComponentType.UserSelect, time: 60000 });
    await guildLeaderConfirmation.deferUpdate();

    const guildLeader = (await guild.members.fetch(guildLeaderConfirmation.values[0])).user;
    logger.debug(`Guild leader: ${guildLeader.tag}`, { interactionId: interaction.id });

    // Guild's advisor
    const guildAdvisorsRes = await guildLeaderConfirmation.editReply({
      content: generateSummaryText("Please select the **advisor(s)** of your guild! *(Up to 3)*", regionName, serverName, guildName, guildLeader),
      components: [guildAdvisorRow],
    });
    const guildAdvisorsConfirmation = await guildAdvisorsRes.awaitMessageComponent({ componentType: ComponentType.UserSelect, time: 60000 });
    await guildAdvisorsConfirmation.deferUpdate();

    const guildAdvisors = await Promise.all(guildAdvisorsConfirmation.values.map(async (advisor) => (await guild.members.fetch(advisor)).user));
    logger.debug(`Guild advisors: ${guildAdvisors.map((advisor) => advisor.tag).join(", ")}`, { interactionId: interaction.id });

    // Members's role
    const membersRoleRes = await guildAdvisorsConfirmation.editReply({
      content: generateSummaryText("Please select the **members role** of your guild!", regionName, serverName, guildName, guildLeader, guildAdvisors),
      components: [membersRoleRow],
    });
    const membersRoleConfirmation = await membersRoleRes.awaitMessageComponent({ componentType: ComponentType.RoleSelect, time: 60000 });
    await membersRoleConfirmation.deferUpdate();

    const membersRole = await guild.roles.fetch(membersRoleConfirmation.values[0]);
    if (!membersRole) {
      logger.debug(`Members role doesn't exist in this server.`, { interactionId: interaction.id });
      return await membersRoleConfirmation.editReply("The role you selected doesn't exist in this server. Please restart the setup process with /setup");
    }
    logger.debug(`Members role: ${membersRole.name}`, { interactionId: interaction.id });

    // Confirm
    const confirmRes = await membersRoleConfirmation.editReply({
      content: generateSummaryText("Please confirm your guild setup!", regionName, serverName, guildName, guildLeader, guildAdvisors, membersRole),
      components: [confirmRow],
    });
    const confirm = await confirmRes.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });
    await confirm.deferUpdate();

    if (confirm.customId !== "confirm") {
      logger.debug("Guild setup cancelled.", { interactionId: interaction.id });

      return confirm.editReply({
        content: generateSummaryText(":x: Guild setup cancelled\nIf you want to restart the setup procedure, use /setup", regionName, serverName, guildName, guildLeader, guildAdvisors, membersRole),
        components: [],
      });
    }

    // API Call
    const body = {
      name: guildName,
      serverId: parseInt(serverConfirmation.values[0]),
      discordGuildId: guild.id,
      discordLeaderId: guildLeader.id,
      discordAdvisorIds: guildAdvisors.map((advisor) => advisor.id),
      discordMembersRoleId: membersRole.id,
    };

    let apiCall;
    const guildExists = await getGuildByDiscordId(guild.id);
    if (guildExists) {
      apiCall = updateGuild(guildExists.id, body);
    } else {
      apiCall = createGuild(body);
    }

    const success = await apiCall;
    if (!success) {
      logger.warn("Failed to setup the guild.", { interactionId: interaction.id });
      return confirm.editReply({ content: "An error occurred while saving your guild setup. Please try again later." });
    }

    await confirm.editReply({ content: generateSummaryText(":white_check_mark: Guild setup saved!", regionName, serverName, guildName, guildLeader, guildAdvisors, membersRole), components: [] });

    logger.info("Guild setup saved successfully.", { interactionId: interaction.id });
  } catch (error) {
    logger.error("An error occurred while setting up the guild.", { interactionId: interaction.id, error });
  }
}

function generateSummaryText(endText: string, regionName?: string, serverName?: string, guildName?: string, guildLeader?: User, guildAdvisor?: User[], membersRole?: Role | null) {
  let text = "";

  if (regionName) {
    text += `**Region**: ${regionName}\n`;
  }
  if (serverName) {
    text += `**Server**: ${serverName}\n`;
  }
  if (guildName) {
    text += `**Guild**: ${guildName}\n`;
  }
  if (guildLeader) {
    text += `**Leader**: ${guildLeader}\n`;
  }
  if (guildAdvisor) {
    text += `**Advisor(s)**: ${guildAdvisor}\n`;
  }
  if (membersRole) {
    text += `**Members Role**: ${membersRole}\n`;
  }
  text += `\n${endText}`;

  return text;
}

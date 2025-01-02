import { DiscordjsError, DiscordjsErrorCodes, Events, Interaction, InteractionCollector } from "discord.js";
import { TEventListener } from "../types/events";
import ExtendedClient from "../structs/ExtendedClient";
import inviteAccept from "../actions/inviteAccept";
import inviteRefuse from "../actions/inviteRefuse";
import logger from "../logger";

const listener: TEventListener<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: Interaction) => {
    logger.debug(`Event: InteractionCreate (${interaction.id}).`);

    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      logger.debug(`Received command: ${interaction.commandName} from ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} [${interaction.guild?.id}].`);

      const command = (interaction.client as ExtendedClient).commands.get(interaction.commandName);

      if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      if (interaction.isAutocomplete()) {
        if (!command.autocomplete) {
          logger.error(`No autocomplete function found for ${interaction.commandName}`);
          return;
        }

        try {
          await command.autocomplete(interaction);
        } catch (error) {
          logger.error(`Error while executing autocomplete for ${interaction.commandName}: `, error);
        }
      }

      if (interaction.isChatInputCommand()) {
        try {
          await command.execute(interaction);
        } catch (error) {
          logger.error(`Error while executing command ${interaction.commandName}: `, error);

          if (error instanceof DiscordjsError && error.code === DiscordjsErrorCodes.InteractionCollectorError && error.message.includes("time")) {
            if (interaction.replied || interaction.deferred) {
              await interaction.editReply({ content: "You took too long to interact with the command", embeds: [], components: [] });
            } else {
              await interaction.reply({ content: "You took too long to interact with the command", ephemeral: true });
            }
          }
        }
      }
    } else if (interaction.isButton()) {
      logger.debug(`Received button interaction: ${interaction.customId} from ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name} [${interaction.guild?.id}].`);

      if (interaction.customId.startsWith("guildInvite")) {
        const [_, value, guildId] = interaction.customId.split("-");

        if (value === "accept") {
          await inviteAccept(interaction, guildId);
        } else {
          await inviteRefuse(interaction);
        }
      } else if (interaction.customId.startsWith("sauroll")) {
        const [_, func, voiceChannelId] = interaction.customId.split("-");

        await interaction.deferReply({ ephemeral: true });

        if (func === "pass") {
          (interaction.client as ExtendedClient).sauroll.pass(voiceChannelId, interaction.user.id);

          await interaction.editReply({ content: "You have passed the roll." });
        } else if (func === "optIn") {
          (interaction.client as ExtendedClient).sauroll.optIn(voiceChannelId, interaction.user.id);

          await interaction.editReply({ content: "You have opted in the rolls." });
        } else if (func === "optOut") {
          (interaction.client as ExtendedClient).sauroll.optOut(voiceChannelId, interaction.user.id);

          await interaction.editReply({ content: "You have opted out the rolls." });
        }
      }
    }
  },
};

export default listener;

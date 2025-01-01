import { Events, Interaction } from "discord.js";
import { TEventListener } from "../types/events";
import ExtendedClient from "../structs/ExtendedClient";
import inviteAccept from "../actions/inviteAccept";
import inviteRefuse from "../actions/inviteRefuse";

const listener: TEventListener<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      const command = (interaction.client as ExtendedClient).commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      if (interaction.isAutocomplete()) {
        if (!command.autocomplete) {
          console.error(`No autocomplete function found for ${interaction.commandName}`);
          return;
        }

        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error(error);
        }
      }

      if (interaction.isChatInputCommand()) {
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
          } else {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
          }
        }
      }
    } else if (interaction.isButton()) {
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
        } else {
          console.error(`No function matching ${func} was found.`);
        }
      }
    }
  },
};

export default listener;

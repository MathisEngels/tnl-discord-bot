import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from "discord.js";

export const invitePlayerNameModal = new ModalBuilder()
  .setTitle("Please enter your character's name")
  .setCustomId("playerNameModal")
  .addComponents(
    new ActionRowBuilder<TextInputBuilder>().setComponents(
      new TextInputBuilder().setCustomId("playerNameInput").setLabel("Character Name").setStyle(TextInputStyle.Short).setPlaceholder("Enter your character's name")
    ),
    new ActionRowBuilder<TextInputBuilder>().setComponents(
      new TextInputBuilder().setCustomId("playerCpInput").setLabel("CP").setStyle(TextInputStyle.Short).setPlaceholder("Enter your character's CP")
    )
  );

const tankButton = new ButtonBuilder().setCustomId("tank").setLabel("Tank").setStyle(ButtonStyle.Primary);
const dpsButton = new ButtonBuilder().setCustomId("dps").setLabel("DPS").setStyle(ButtonStyle.Primary);
const healerButton = new ButtonBuilder().setCustomId("healer").setLabel("Healer").setStyle(ButtonStyle.Primary);
export const inviteRoleRow = new ActionRowBuilder<ButtonBuilder>().addComponents(tankButton, dpsButton, healerButton);

const flashwaveButton = new ButtonBuilder().setCustomId("flashwave").setLabel("Flashwave").setStyle(ButtonStyle.Primary);
const sleepBombButton = new ButtonBuilder().setCustomId("sleepBomb").setLabel("Sleep Bomb").setStyle(ButtonStyle.Primary);
const spinnerButton = new ButtonBuilder().setCustomId("spinner").setLabel("Spinner").setStyle(ButtonStyle.Primary);
const noneButton = new ButtonBuilder().setCustomId("none").setLabel("None").setStyle(ButtonStyle.Primary);
export const inviteClassRow = new ActionRowBuilder<ButtonBuilder>().addComponents(flashwaveButton, sleepBombButton, spinnerButton, noneButton);

const confirmButton = new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success);
const cancelButton = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);
export const inviteConfirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

const yesButton = new ButtonBuilder().setCustomId("yes").setLabel("Yes").setStyle(ButtonStyle.Success);
const noButton = new ButtonBuilder().setCustomId("no").setLabel("No").setStyle(ButtonStyle.Danger);
export const yesNoButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(yesButton, noButton);
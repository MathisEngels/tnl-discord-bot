import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CollectedInteraction, ComponentType, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import { StringSelectPage } from "../types/pagination";
import logger from "../logger";

type StringSelectPaginationOptions = {
  placeholder?: string;
  time?: number;
  defer?: boolean;
};

export default async function stringSelectPagination(
  interaction: CollectedInteraction,
  pages: StringSelectPage[],
  cb: (i: StringSelectMenuInteraction) => Promise<void>,
  options: StringSelectPaginationOptions = {}
) {
  const time = options.time || 60000;
  const placeholder = options.placeholder || "Select an option";
  const defer = options.defer ?? true;

  if (!interaction || !pages || pages.length === 0) {
    logger.error("Invalid interaction or pages provided.");
    return;
  }

  if (!interaction.deferred) await interaction.deferReply();

  if (pages.length === 1) {
    logger.debug("Only one page provided, skipping pagination.");

    const select = new StringSelectMenuBuilder()
      .setCustomId("stringSelect")
      .setPlaceholder(placeholder)
      .addOptions(
        pages[0].map((page) => {
          const option = new StringSelectMenuOptionBuilder().setLabel(page.label).setValue(page.value);
          if (page.description) option.setDescription(page.description);
          return option;
        })
      );
    const stringSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    const stringSelectMsg = await interaction.editReply({ content: "", embeds: [], components: [stringSelect] });
    const stringSelectAns = await stringSelectMsg.awaitMessageComponent({ componentType: ComponentType.StringSelect, time });
    await stringSelectAns.deferUpdate();

    return await cb(stringSelectAns);
  }

  let currentPage = 0;

  const first = new ButtonBuilder().setCustomId("pageFirst").setLabel("⏮️").setStyle(ButtonStyle.Primary).setDisabled(true);
  const previous = new ButtonBuilder().setCustomId("pagePrevious").setLabel("◀️").setStyle(ButtonStyle.Primary).setDisabled(true);
  const pageCount = new ButtonBuilder()
    .setCustomId("pageCount")
    .setLabel(`${currentPage + 1}/${pages.length}`)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);
  const next = new ButtonBuilder().setCustomId("pageNext").setLabel("▶️").setStyle(ButtonStyle.Primary);
  const last = new ButtonBuilder().setCustomId("pageLast").setLabel("⏭️").setStyle(ButtonStyle.Primary);

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(first, previous, pageCount, next, last);

  const select = new StringSelectMenuBuilder()
    .setCustomId("stringSelect")
    .setPlaceholder(placeholder)
    .addOptions(
      pages[currentPage].map((page) => {
        const option = new StringSelectMenuOptionBuilder().setLabel(page.label).setValue(page.value);
        if (page.description) option.setDescription(page.description);
        return option;
      })
    );
  const stringSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

  const msg = await interaction.editReply({ content: "", embeds: [], components: [stringSelect, buttons] });

  const collector = msg.createMessageComponentCollector({ time });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id) return await i.reply({ content: "You are not allowed to interact with this select menu.", ephemeral: true });

    if (i.customId === "pageFirst") {
      currentPage = 0;
    } else if (i.customId === "pagePrevious") {
      currentPage = Math.max(0, currentPage - 1);
    } else if (i.customId === "pageNext") {
      currentPage = Math.min(pages.length - 1, currentPage + 1);
    } else if (i.customId === "pageLast") {
      currentPage = pages.length - 1;
    } else if (i.customId === "stringSelect") {
      if (defer) await i.deferUpdate();
      return collector.stop();
    }

    if (currentPage === 0) {
      first.setDisabled(true);
      previous.setDisabled(true);
      next.setDisabled(false);
      last.setDisabled(false);
    } else if (currentPage === pages.length - 1) {
      first.setDisabled(false);
      previous.setDisabled(false);
      next.setDisabled(true);
      last.setDisabled(true);
    } else {
      first.setDisabled(false);
      previous.setDisabled(false);
      next.setDisabled(false);
      last.setDisabled(false);
    }

    pageCount.setLabel(`${currentPage + 1}/${pages.length}`);

    const newSelect = new StringSelectMenuBuilder()
      .setCustomId("stringSelect")
      .setPlaceholder(placeholder)
      .addOptions(
        pages[currentPage].map((page) => {
          const option = new StringSelectMenuOptionBuilder().setLabel(page.label).setValue(page.value);
          if (page.description) option.setDescription(page.description);
          return option;
        })
      );
    const newStringSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(newSelect);

    await i.deferUpdate();
    await i.editReply({ content: "", embeds: [], components: [newStringSelect, buttons] });

    collector.resetTimer();
  });

  collector.on("end", async (c) => {
    if (c.last() && c.last()?.customId === "stringSelect") await cb(c.last() as StringSelectMenuInteraction);
  });
}

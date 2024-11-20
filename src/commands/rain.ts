import { AutocompleteInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getAllRegions } from "../api/region";
import { Choices } from "../types/commands";
import { Browser, Builder, By, until } from "selenium-webdriver";

export const data = new SlashCommandBuilder()
  .setName("rain")
  .setDescription("Tell you when it will rain")
  .addStringOption((option) => option.setName("region").setDescription("The region you want to know the weather for").setAutocomplete(true));

export async function autocomplete(interaction: AutocompleteInteraction) {
  const regions = await getAllRegions();

  const choices: Choices = regions.map((region) => ({ name: region.name, value: region.name }));

  return interaction.respond(choices);
}

type Region = "EA" | "WA" | "SA" | "EU" | "OCE";

export async function execute(interaction: CommandInteraction) {
  interaction.deferReply();

  const buttonXPathMap = {
    "EA": "/html/body/div[1]/div/main/div[4]/div[1]/div/div/div[2]/div[1]",
    "WA": "/html/body/div[1]/div/main/div[4]/div[1]/div/div/div[2]/div[2]",
    "SA": "/html/body/div[1]/div/main/div[4]/div[1]/div/div/div[2]/div[3]",
    "EU": "/html/body/div[1]/div/main/div[4]/div[1]/div/div/div[2]/div[4]",
    "OCE": "/html/body/div[1]/div/main/div[4]/div[1]/div/div/div[2]/div[5]",
  }

  try {
    let driver = await new Builder().forBrowser(Browser.FIREFOX).usingServer("http://192.168.1.2:4444").build();
    console.log("Driver created");
    await driver.get("https://questlog.gg/throne-and-liberty/en-nc/rain-schedule");
    console.log("Page loaded");

    await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/main/div[4]/div[1]/div/div/div")), 5000).click();

    const region = interaction.options.get("region")?.value as Region | undefined;
    if (!region) {
      console.log("No region provided");
      await driver.findElement(By.xpath(buttonXPathMap["EU"])).click();
      console.log("EU clicked");
    } else {
      await driver.findElement(By.xpath(buttonXPathMap[region])).click();
    }

    console.log("Region clicked");
    const dayNightText = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/main/div[4]/div[2]/div/span")), 5000).getText();
    console.log(dayNightText);

    return interaction.editReply(dayNightText);
  } catch (error) {
    console.error(error);
  }
}

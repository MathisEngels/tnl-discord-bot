import { ChatInputCommandInteraction, CommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { readFile } from "fs/promises";
import path from "path";
import Sharp from "sharp";
import { getPublicPath } from "../utils";

const bosses = [
  { name: "Adentus", value: "adentus" },
  { name: "Ahzreil", value: "ahzreil" },
  { name: "Aridus", value: "aridus" },
  { name: "Chernobog", value: "chernobog" },
  { name: "Cornelius", value: "cornelius" },
  { name: "Excavator", value: "excavator" },
  { name: "Grand Aelon", value: "grandaelon" },
  { name: "Junobote", value: "junobote" },
  { name: "Kowazan", value: "kowazan" },
  { name: "Malakar", value: "malakar" },
  { name: "Minezerok", value: "minezerok" },
  { name: "Morokai", value: "morokai" },
  { name: "Nirma", value: "nirma" },
  { name: "Talus", value: "talus" },
  // Archbosses
  { name: "Tevent", value: "tevent" },
  { name: "Bellandir", value: "bellandir" },
];

const maxPings = 20;

type Ping = { left: number; top: number };
type PingsInfo = {
  [key: string]: Ping[];
};

const pingsInfo: PingsInfo = {
  adentus: [
    { left: 296, top: 177 },
    { left: 360, top: 281 },
    { left: 447, top: 306 },
    { left: 524, top: 391 },
    { left: 615, top: 373 },
    { left: 446, top: 486 },
    { left: 330, top: 531 },
    { left: 303, top: 614 },
    { left: 254, top: 448 },
    { left: 307, top: 335 },
  ],
  ahzreil: [
    { left: 459, top: 483 },
    { left: 383, top: 461 },
    { left: 260, top: 327 },
    { left: 275, top: 245 },
    { left: 397, top: 222 },
    { left: 538, top: 181 },
    { left: 487, top: 322 },
    { left: 566, top: 324 },
    { left: 282, top: 438 },
  ],
  aridus: [
    { left: 139, top: 208 },
    { left: 141, top: 76 },
    { left: 263, top: 77 },
    { left: 265, top: 201 },
  ],
  bellandir: [
    { left: 532, top: 168 },
    { left: 652, top: 287 },
    { left: 559, top: 337 },
    { left: 507, top: 429 },
    { left: 417, top: 471 },
    { left: 311, top: 385 },
    { left: 301, top: 231 },
    { left: 433, top: 203 },
  ],
  chernobog: [
    { left: 411, top: 558 },
    { left: 367, top: 423 },
    { left: 287, top: 310 },
    { left: 365, top: 161 },
    { left: 421, top: 103 },
    { left: 550, top: 97 },
    { left: 611, top: 219 },
    { left: 543, top: 381 },
    { left: 464, top: 330 },
  ],
  cornelius: [
    { left: 203, top: 124 },
    { left: 406, top: 306 },
    { left: 240, top: 473 },
    { left: 234, top: 233 },
    { left: 240, top: 365 },
    { left: 159, top: 298 },
  ],
  excavator: [
    { left: 411, top: 278 },
    { left: 278, top: 274 },
    { left: 203, top: 338 },
    { left: 156, top: 221 },
    { left: 204, top: 163 },
    { left: 276, top: 120 },
    { left: 351, top: 182 },
  ],
  grandaelon: [
    { left: 327, top: 233 },
    { left: 395, top: 252 },
    { left: 413, top: 316 },
    { left: 461, top: 349 },
    { left: 559, top: 301 },
    { left: 544, top: 205 },
    { left: 460, top: 188 },
  ],
  junobote: [
    { left: 657, top: 295 },
    { left: 514, top: 300 },
    { left: 408, top: 213 },
    { left: 393, top: 383 },
    { left: 330, top: 284 },
  ],
  kowazan: [
    { left: 162, top: 252 },
    { left: 328, top: 322 },
    { left: 419, top: 230 },
    { left: 424, top: 116 },
    { left: 343, top: 72 },
    { left: 224, top: 107 },
  ],
  malakar: [
    { left: 300, top: 360 },
    { left: 295, top: 258 },
    { left: 396, top: 176 },
    { left: 493, top: 204 },
    { left: 490, top: 300 },
    { left: 436, top: 354 },
  ],
  minezerok: [
    { left: 220, top: 377 },
    { left: 245, top: 272 },
    { left: 308, top: 331 },
    { left: 320, top: 202 },
    { left: 395, top: 262 },
    { left: 413, top: 103 },
    { left: 484, top: 166 },
  ],
  morokai: [
    { left: 234, top: 234 },
    { left: 343, top: 309 },
    { left: 341, top: 190 },
    { left: 344, top: 98 },
    { left: 275, top: 73 },
    { left: 203, top: 101 },
    { left: 134, top: 209 },
  ],
  nirma: [
    { left: 190, top: 121 },
    { left: 251, top: 232 },
    { left: 143, top: 300 },
    { left: 73, top: 184 },
  ],
  talus: [
    { left: 520, top: 131 },
    { left: 383, top: 162 },
    { left: 297, top: 98 },
    { left: 204, top: 119 },
    { left: 169, top: 218 },
    { left: 223, top: 296 },
    { left: 306, top: 334 },
    { left: 390, top: 285 },
  ],
  tevent: [
    { left: 197, top: 401 },
    { left: 400, top: 515 },
    { left: 372, top: 406 },
    { left: 542, top: 305 },
    { left: 465, top: 304 },
    { left: 298, top: 226 },
    { left: 385, top: 192 },
    { left: 217, top: 299 },
    { left: 292, top: 379 },
  ],
};

const data = new SlashCommandBuilder()
  .setName("pings")
  .setDescription("Get in-game PvP pings for the bosses.")
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) => option.setName("boss1").setDescription("The 1st boss you want to get pings for.").setRequired(true).addChoices(bosses))
  .addStringOption((option) => option.setName("boss2").setDescription("The 2nd boss you want to get pings for.").setRequired(false).addChoices(bosses))
  .addStringOption((option) => option.setName("boss3").setDescription("The 3rd boss you want to get pings for.").setRequired(false).addChoices(bosses));

async function execute(interaction: CommandInteraction) {
  await interaction.reply("Processing...");
  const files = [];
  let maxPingsExceeded = false;
  
  const boss1 = (interaction as ChatInputCommandInteraction).options.getString("boss1")!;
  const boss2 = (interaction as ChatInputCommandInteraction).options.getString("boss2");
  const boss3 = (interaction as ChatInputCommandInteraction).options.getString("boss3");

  let currentPing = 1;

  const boss1Pings = [];
  for (const ping of pingsInfo[boss1]) {
    boss1Pings.push({ input: await readFile(path.join(getPublicPath(), `/guildPins/${currentPing}.png`)), top: ping.top, left: ping.left });
    currentPing++;
  }

  const boss1Zone = await readFile(path.join(getPublicPath(), `/bossZones/${boss1}.png`));
  const boss1Image = await Sharp(boss1Zone)
    .composite(boss1Pings)
    .toBuffer();
  files.push({ attachment: boss1Image, name: `tnl-bot-${boss1}-1.png` });

  if (boss2) {
    const boss2Pings = [];

    for (const ping of pingsInfo[boss2]) {
      if (currentPing > maxPings) {
        maxPingsExceeded = true;
        break;
      };

      boss2Pings.push({ input: await readFile(path.join(getPublicPath(), `/guildPins/${currentPing}.png`)), top: ping.top, left: ping.left });
      currentPing++;
    }

    const boss2Zone = await readFile(path.join(getPublicPath(), `/bossZones/${boss2}.png`));
    const boss2Image = await Sharp(boss2Zone)
      .composite(boss2Pings)
      .toBuffer();
    files.push({ attachment: boss2Image, name: `tnl-bot-${boss2}-2.png` });
  }

  if (boss3) {
    const boss3Pings = [];

    for (const ping of pingsInfo[boss3]) {
      if (currentPing > maxPings) {
        maxPingsExceeded = true;
        break;
      };
      boss3Pings.push({ input: await readFile(path.join(getPublicPath(), `/guildPins/${currentPing}.png`)), top: ping.top, left: ping.left });
      currentPing++;
    }

    const boss3Zone = await readFile(path.join(getPublicPath(), `/bossZones/${boss3}.png`));
    const boss3Image = await Sharp(boss3Zone)
      .composite(boss3Pings)
      .toBuffer();
    files.push({ attachment: boss3Image, name: `tnl-bot-${boss3}-3.png` });
  }

  const message = maxPingsExceeded ? "Max pings exceeded. Only the first 20 pings are shown." : "Here's the pings!";

  await interaction.editReply({ content: message, files: files });
}

export default { data, execute };

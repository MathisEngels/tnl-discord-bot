import { ChatInputCommandInteraction, CommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { readFile } from "fs/promises";
import path from "path";
import Sharp from "sharp";

const bosses = [
  { name: "Adentus", value: "adentus" },
  { name: "Ahzreil", value: "ahzreil" },
  { name: "Aridus", value: "aridus" },
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
  { name: "Tchernobog", value: "tchernobog" },
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
    { left: 224, top: 161 },
    { left: 193, top: 206 },
    { left: 241, top: 254 },
    { left: 319, top: 187 },
    { left: 275, top: 145 },
  ],
  ahzreil: [
    { left: 374, top: 236 },
    { left: 305, top: 224 },
    { left: 278, top: 140 },
    { left: 369, top: 102 },
    { left: 437, top: 165 },
  ],
  aridus: [
    { left: 170, top: 242 },
    { left: 95, top: 174 },
    { left: 170, top: 83 },
    { left: 250, top: 162 },
    { left: 145, top: 167 },
    { left: 214, top: 166 },
  ],
  bellandir: [
    { left: 376, top: 438 },
    { left: 347, top: 300 },
    { left: 427, top: 248 },
    { left: 543, top: 307 },
    { left: 563, top: 401 },
  ],
  cornelius: [],
  excavator: [
    { left: 223, top: 377 },
    { left: 223, top: 323 },
    { left: 194, top: 224 },
    { left: 347, top: 257 },
    { left: 303, top: 178 },
  ],
  grandaelon: [
    { left: 203, top: 138 },
    { left: 222, top: 190 },
    { left: 250, top: 210 },
    { left: 313, top: 182 },
    { left: 300, top: 123 },
    { left: 246, top: 102 },
  ],
  junobote: [
    { left: 515, top: 316 },
    { left: 412, top: 398 },
    { left: 278, top: 410 },
    { left: 239, top: 258 },
    { left: 377, top: 217 },
  ],
  kowazan: [
    { left: 164, top: 158 },
    { left: 167, top: 95 },
    { left: 231, top: 79 },
    { left: 250, top: 171 },
    { left: 219, top: 210 },
  ],
  malakar: [],
  minezerok: [],
  morokai: [],
  nirma: [
    { left: 260, top: 192 },
    { left: 163, top: 244 },
    { left: 109, top: 139 },
    { left: 211, top: 87 },
  ],
  talus: [
    { left: 347, top: 154 },
    { left: 263, top: 232 },
    { left: 173, top: 197 },
    { left: 296, top: 77 },
    { left: 206, top: 57 },
  ],
  tchernobog: [
    { left: 190, top: 374 },
    { left: 321, top: 280 },
    { left: 421, top: 375 },
    { left: 378, top: 412 },
    { left: 287, top: 501 },
    { left: 220, top: 453 },
  ],
  tevent: [
    { left: 413, top: 202 },
    { left: 311, top: 314 },
    { left: 181, top: 273 },
    { left: 186, top: 121 },
    { left: 325, top: 100 },
    { left: 304, top: 258 },
    { left: 201, top: 205 },
    { left: 231, top: 134 },
    { left: 302, top: 129 },
    { left: 129, top: 307 },
  ],
};

const data = new SlashCommandBuilder()
  .setName("pings")
  .setDescription("Get in-game PVP pings for the bosses.")
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
    boss1Pings.push({ input: await readFile(path.join(process.cwd(), `./assets/guildPins/${currentPing}.png`)), top: ping.top, left: ping.left });
    currentPing++;
  }

  const boss1Zone = await readFile(path.join(process.cwd(), `./assets/bossZones/${boss1}.png`));
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

      boss2Pings.push({ input: await readFile(path.join(process.cwd(), `./assets/guildPins/${currentPing}.png`)), top: ping.top, left: ping.left });
      currentPing++;
    }

    const boss2Zone = await readFile(path.join(process.cwd(), `./assets/bossZones/${boss2}.png`));
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
      boss3Pings.push({ input: await readFile(path.join(process.cwd(), `./assets/guildPins/${currentPing}.png`)), top: ping.top, left: ping.left });
      currentPing++;
    }

    const boss3Zone = await readFile(path.join(process.cwd(), `./assets/bossZones/${boss3}.png`));
    const boss3Image = await Sharp(boss3Zone)
      .composite(boss3Pings)
      .toBuffer();
    files.push({ attachment: boss3Image, name: `tnl-bot-${boss3}-3.png` });
  }

  const message = maxPingsExceeded ? "Max pings exceeded. Only the first 20 pings are shown." : "Here's the pings!";

  await interaction.editReply({ content: message, files: files });
}

export default { data, execute };

import { CreateGuildBody, TGuild, UpdateGuildBody } from "../types/API";

export async function getGuildByDiscordId(discordGuildId: string): Promise<TGuild | null> {
  try {
    const response = await fetch(`${process.env.API_URL}/guilds/${discordGuildId}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createGuild(body: CreateGuildBody): Promise<boolean> {
  try {
    await fetch(`${process.env.API_URL}/guilds`, { headers: { "Content-Type": "application/json" }, method: "POST", body: JSON.stringify(body) });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateGuild(id: number, body: UpdateGuildBody): Promise<boolean> {
  try {
    await fetch(`${process.env.API_URL}/guilds/${id}`, { headers: { "Content-Type": "application/json" }, method: "PUT", body: JSON.stringify(body) });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}


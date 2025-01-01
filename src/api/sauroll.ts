import { CreateSaurollSubscriptionBody, GetSaurollSubscribersResponse, GetSaurollSubscriptionByGuildIdResponse, UpdateSaurollSubscriptionBody } from "../types/API";

export async function getSaurollSubscribers(): Promise<GetSaurollSubscribersResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSaurollSubscriptionsByDiscordGuildId(discordGuildId: string): Promise<GetSaurollSubscriptionByGuildIdResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll/${discordGuildId}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createSaurollSubscription(data: CreateSaurollSubscriptionBody): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateSaurollSubscription(discordVoiceChannelId: string, data: UpdateSaurollSubscriptionBody): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll/${discordVoiceChannelId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteSaurollSubscription(discordVoiceChannelId: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll/${discordVoiceChannelId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

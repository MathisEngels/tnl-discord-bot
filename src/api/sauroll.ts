import { CreateSaurollSubscriptionBody, GetSaurollSubscribersResponse, GetSaurollSubscription as GetSaurollSubscriptionResponse, UpdateSaurollSubscriptionBody } from "../types/API";

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

export async function getSaurollSubscription(discordGuildId: string): Promise<GetSaurollSubscriptionResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll/${discordGuildId}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return null;
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

export async function updateSaurollSubscription(discordGuildId: string, data: UpdateSaurollSubscriptionBody): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll/${discordGuildId}`, {
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

export async function deleteSaurollSubscription(discordGuildId: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll/${discordGuildId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
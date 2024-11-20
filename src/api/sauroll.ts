import { GetSaurollDataResponse } from "../types/API";

export async function getSaurollData(): Promise<GetSaurollDataResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/sauroll`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

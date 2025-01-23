import { logStack } from "./error";

export const BASE_INIT = {
  next: { revalidate: 600 }, // sets next JS cache to revalidate data in seconds
};

export async function fetchData<T>(
  url: string,
  init?: RequestInit
): Promise<T | undefined> {
  const urlPrefix = process.env.BASE_URL;
  try {
    const res = await fetch(`${urlPrefix}/api/${url}`, { ...BASE_INIT, ...init });
    if (res.ok) {
      return res.json();
    } else {
      console.log(`Status: ${res.status}, Status Text: ${res.statusText}`);
    }
  } catch (error) {
    logStack(error)
  }
}

import { cookies } from "next/headers";
import { logStack } from "./error";

export const BASE_INIT = {
  next: { revalidate: process.env.NODE_ENV === "development" ? 1 : 600 },
};

export async function fetchData<T>(
  url: string,
  init?: RequestInit,
): Promise<T | undefined> {
  const urlPrefix = process.env.BASE_URL;
  try {
    const res = await fetch(`${urlPrefix}/api/${url}`, {
      ...BASE_INIT,
      ...init,
      next: { ...BASE_INIT.next, ...init?.next },
    });
    if (res.ok) {
      return res.json();
    } else {
      console.warn(`Status: ${res.status}, Status Text: ${res.statusText}`);
    }
  } catch (error) {
    logStack(error);
  }
}

export async function fetchSafe<T>(
  url: string,
  init?: RequestInit,
  includeCookies?: boolean,
): Promise<{ response?: T; isError: boolean }> {
  let response: T | undefined;
  let isError = false;
  const cookie = (await cookies()).toString();
  try {
    response = await fetchData(url, {
      ...init,
      headers: {
        ...init?.headers,
        ...(includeCookies && { cookie }),
      },
    });
  } catch (error) {
    logStack(error);
    isError = true;
  }
  return { response, isError };
}

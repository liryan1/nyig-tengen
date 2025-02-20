import type { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";

/**
 * See https://redux-toolkit.js.org/rtk-query/usage/error-handling
 * Log a warning and show error toast
 */
export const rtkQueryErrorLogger: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      console.error(getErrorMessage(action));
    }

    return next(action);
  };

function getErrorMessage(action: any) {
  let message = action.error?.message;
  if (
    action.payload?.status === 400 &&
    typeof action.payload?.data === "string"
  ) {
    message = extractErrorMessage(action.payload.data);
  } else if (action.payload?.originalStatus === 401) {
    message = "Permission denied";
  } else if (action.payload?.data) {
    message = action.payload.data.message;
  }
  return message;
}

function extractErrorMessage(error: string) {
  if (typeof error === "string") {
    return error;
  }
  try {
    const zodError = JSON.parse(error);
    return (
      "Request error: " +
      zodError
        .map((e: any) => {
          return `**${e.code}**
        '${e.path?.join(", ")}'
        should be '${e.expected}'
        but it is actually '${e.received}'
      `;
        })
        .join(", ")
    );
  } catch {
    return "An unknown error has occurred";
  }
}

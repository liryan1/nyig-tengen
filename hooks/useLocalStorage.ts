"use client";

import { useEffect, useState } from "react";

export const PROBLEM_EDIT_BOARD_SIZE_KEY = "tengen-problem-edit-board-size";

export function useLocalStorage<T>(key: string, fallbackValue: T) {
  // Retrieve the initial value from localStorage if it exists
  const storedValue =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const initial = storedValue ? JSON.parse(storedValue) : fallbackValue;

  // Create a state to hold the current value
  const [value, setValue] = useState<T>(initial);

  // Update the local storage whenever the value changes
  useEffect(() => {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as const;
}

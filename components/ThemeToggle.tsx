"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" ? window.localStorage.getItem("theme") === "dark" : false
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  if (!mounted) return;

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" fill="black" />}
    </button>
  );
};

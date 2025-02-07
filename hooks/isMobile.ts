"use client";

import { useState, useEffect, useRef } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  // Effect to track screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's `sm` breakpoint (640px)
    };

    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isMobile;
}

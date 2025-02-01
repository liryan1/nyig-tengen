"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ShowCoordContextProps {
  showCoord: boolean;
  toggleShowCoord: () => void;
}

const ShowCoordContext = createContext<ShowCoordContextProps | undefined>(
  undefined,
);

export const ShowCoordProvider = ({ children }: { children: ReactNode }) => {
  const [showCoord, setShowCoord] = useState(false);

  const toggleShowCoord = () => {
    setShowCoord((prev) => !prev);
  };

  return (
    <ShowCoordContext.Provider value={{ showCoord, toggleShowCoord }}>
      {children}
    </ShowCoordContext.Provider>
  );
};

export const useShowCoord = () => {
  const context = useContext(ShowCoordContext);
  if (!context) {
    throw new Error("useShowCoord must be used within a ShowCoordProvider");
  }
  return context;
};

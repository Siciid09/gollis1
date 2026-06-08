"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define what kind of data we want to share globally
interface GlobalContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  currentUser: any | null; // Replace 'any' with your actual User type later
  setCurrentUser: (user: any | null) => void;
}

// Create the Context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Create the Provider Component
export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  return (
    <GlobalContext.Provider 
      value={{ 
        isSidebarOpen, 
        setIsSidebarOpen,
        currentUser,
        setCurrentUser
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

// Create a custom hook to easily use this context in any component
export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}
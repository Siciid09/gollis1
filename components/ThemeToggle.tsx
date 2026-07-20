"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title="Toggle light / dark mode"
      className="flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all shrink-0"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
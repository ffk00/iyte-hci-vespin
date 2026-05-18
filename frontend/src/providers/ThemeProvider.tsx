import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  theme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
  defaultMode?: ThemeMode;
};

export function ThemeProvider({ children, defaultMode = "system" }: Props) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const value = useMemo<ThemeContextValue>(() => {
    const theme: ResolvedTheme =
      mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
    return { mode, theme, setMode };
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}

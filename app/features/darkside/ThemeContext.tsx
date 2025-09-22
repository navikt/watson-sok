import { Theme } from "@navikt/ds-react";
import { createContext, useContext, useState } from "react";

type Themes = "light" | "dark";

const ThemeContext = createContext<{
  theme: Themes;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark";
};

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Themes>(defaultTheme);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Theme theme={theme}>{children}</Theme>
    </ThemeContext.Provider>
  );
}

import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "expresslane-theme";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
});

const getInitialTheme = (defaultTheme) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return defaultTheme;
  }
};

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setTheme] = useState(() => getInitialTheme(defaultTheme));

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable (private mode) — theme still applies for this session
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
  defaultTheme: PropTypes.oneOf(["light", "dark"]),
};

export const useTheme = () => useContext(ThemeContext);

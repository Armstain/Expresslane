import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "light", // Default theme
    setTheme: () => { }, // Placeholder function
});

export function ThemeProvider({ children, defaultTheme = "light" }) {
    const getInitialTheme = () => {
        // Check localStorage for a saved theme
        const savedTheme = localStorage.getItem("expresslane-theme");
        return savedTheme ? savedTheme : defaultTheme;
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark"); // Remove existing classes
        root.classList.add(theme);

        // Store theme in localStorage (optional)
        localStorage.setItem("expresslane-theme", theme);
    }, [theme]);

    const handleSetTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    return useContext(ThemeContext);
};

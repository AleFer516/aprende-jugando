// src/context/ThemeContext.jsx
// Contexto para manejar el tema del dashboard de admin

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Obtener tema guardado en localStorage o usar "claro" por defecto
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("adminTheme");
    return savedTheme || "claro";
  });

  // Guardar tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("adminTheme", theme);

    // Aplicar clase al body para el tema
    if (theme === "oscuro") {
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    } else {
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "claro" ? "oscuro" : "claro"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "oscuro",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

import { useState, useEffect } from 'react';
import { Language } from '../utils/i18n';

export function useSettings() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("mt_lang");
    return (saved as Language) || "en";
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("mt_darkMode");
    if (saved !== null) return saved === "true";
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("mt_lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("mt_darkMode", darkMode.toString());
  }, [darkMode]);

  return { lang, setLang, darkMode, setDarkMode };
}

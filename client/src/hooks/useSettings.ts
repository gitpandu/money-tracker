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

  const [cycleDay, setCycleDay] = useState<number>(() => {
    const saved = localStorage.getItem("mt_cycleDay");
    return saved ? parseInt(saved, 10) : 25;
  });

  const [carryOver, setCarryOver] = useState<boolean>(() => {
    const saved = localStorage.getItem("mt_carryOver");
    return saved !== null ? saved === "true" : true;
  });

  const [copyBudgets, setCopyBudgets] = useState<boolean>(() => {
    const saved = localStorage.getItem("mt_copyBudgets");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("mt_lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("mt_darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("mt_cycleDay", cycleDay.toString());
  }, [cycleDay]);

  useEffect(() => {
    localStorage.setItem("mt_carryOver", carryOver.toString());
  }, [carryOver]);

  useEffect(() => {
    localStorage.setItem("mt_copyBudgets", copyBudgets.toString());
  }, [copyBudgets]);

  return { 
    lang, setLang, 
    darkMode, setDarkMode,
    cycleDay, setCycleDay,
    carryOver, setCarryOver,
    copyBudgets, setCopyBudgets
  };
}

// src/hooks/useTranslation.ts
import { useState } from "react";
import de from "../locales/de.json";
import en from "../locales/en.json";

type Language = "de" | "en";
type Translations = typeof de;

export const useTranslation = () => {
  // Varsayılan dili tarayıcı diline göre veya manuel 'de' seçelim
  const [lang, setLang] = useState<Language>("de");

  const translations: Record<Language, Translations> = { de, en };

  const t = (key: keyof Translations): string => {
    return translations[lang][key] || key;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "de" ? "en" : "de"));
  };

  return { t, lang, toggleLanguage };
};

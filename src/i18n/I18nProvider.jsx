import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  languageLabels,
  normalizeLanguage,
  translations,
} from "./translations";

const I18nContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

function preserveOuterWhitespace(source, next) {
  const start = source.match(/^\s*/)?.[0] ?? "";
  const end = source.match(/\s*$/)?.[0] ?? "";
  return `${start}${next}${end}`;
}

function buildReverseMap() {
  return Object.entries(translations.ja).reduce((acc, [ko, ja]) => {
    acc[ja] = ko;
    return acc;
  }, {});
}

const reverseJaTranslations = buildReverseMap();

function translateTextValue(value, language) {
  if (!value || typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  if (language === "ja") {
    const next = translations.ja[trimmed];
    return next ? preserveOuterWhitespace(value, next) : value;
  }

  const next = reverseJaTranslations[trimmed];
  return next ? preserveOuterWhitespace(value, next) : value;
}

function translateElementAttributes(root, language) {
  const selector = "[placeholder], [alt], [title], [aria-label]";
  const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll(selector)] : [];

  elements.forEach((element) => {
    if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) return;

    ["placeholder", "alt", "title", "aria-label"].forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      const current = element.getAttribute(attr);
      const next = translateTextValue(current, language);
      if (next !== current) element.setAttribute(attr, next);
    });
  });
}

function translateTextNodes(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const current = node.nodeValue;
    const next = translateTextValue(current, language);
    if (next !== current) node.nodeValue = next;
  });
}

function translateDom(language) {
  if (typeof document === "undefined") return;
  const root = document.querySelector(".app-viewport") ?? document.body;
  translateTextNodes(root, language);
  translateElementAttributes(root, language);
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState((prev) => {
      const normalized = normalizeLanguage(
        typeof nextLanguage === "function" ? nextLanguage(prev) : nextLanguage
      );
      localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
      document.documentElement.lang = normalized;
      return normalized;
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "ko" ? "ja" : "ko"));
  }, [setLanguage]);

  const t = useCallback(
    (koText) => {
      if (language === "ko") return koText;
      return translations[language]?.[koText] ?? koText;
    },
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language;
    translateDom(language);

    const root = document.querySelector(".app-viewport") ?? document.body;
    const observer = new MutationObserver((mutations) => {
      const shouldTranslate = mutations.some(
        (mutation) =>
          mutation.type === "childList" ||
          mutation.type === "characterData" ||
          mutation.type === "attributes"
      );

      if (shouldTranslate) {
        window.requestAnimationFrame(() => translateDom(language));
      }
    });

    observer.observe(root, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["placeholder", "alt", "title", "aria-label"],
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      languageLabel: languageLabels[language],
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, t, toggleLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ColorScheme = "system" | "light" | "dark";
export type FontScale = "default" | "senior";

interface ThemeState {
  scheme: ColorScheme;
  setScheme: (s: ColorScheme) => void;
  fontScale: FontScale;
  setFontScale: (f: FontScale) => void;
}

const ThemeCtx = createContext<ThemeState | null>(null);

const SCHEME_KEY = "haru.theme.scheme";
const FONT_KEY = "haru.theme.font";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>("system");
  const [fontScale, setFontScaleState] = useState<FontScale>("default");

  // 초기 로드 — localStorage + matchMedia
  useEffect(() => {
    const savedScheme = (localStorage.getItem(SCHEME_KEY) as ColorScheme | null) ?? "system";
    const savedFont = (localStorage.getItem(FONT_KEY) as FontScale | null) ?? "default";
    setSchemeState(savedScheme);
    setFontScaleState(savedFont);
  }, []);

  // 적용
  useEffect(() => {
    const apply = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = scheme === "dark" || (scheme === "system" && prefersDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.dataset.fontScale = fontScale;
    };
    apply();
    if (scheme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [scheme, fontScale]);

  const setScheme = useCallback((s: ColorScheme) => {
    setSchemeState(s);
    localStorage.setItem(SCHEME_KEY, s);
  }, []);

  const setFontScale = useCallback((f: FontScale) => {
    setFontScaleState(f);
    localStorage.setItem(FONT_KEY, f);
  }, []);

  return (
    <ThemeCtx.Provider value={{ scheme, setScheme, fontScale, setFontScale }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

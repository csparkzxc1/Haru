import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme as nwColorScheme } from "nativewind";

export type ColorScheme = "system" | "light" | "dark";
export type FontScale = "default" | "senior";

interface ThemeState {
  scheme: ColorScheme;
  setScheme: (s: ColorScheme) => void;
  fontScale: FontScale;
  setFontScale: (f: FontScale) => void;
}

const SCHEME_KEY = "haru.theme.scheme";
const FONT_KEY = "haru.theme.font";

const ThemeCtx = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorScheme>("system");
  const [fontScale, setFontScaleState] = useState<FontScale>("default");

  useEffect(() => {
    (async () => {
      const [s, f] = await AsyncStorage.multiGet([SCHEME_KEY, FONT_KEY]);
      if (s[1]) setSchemeState(s[1] as ColorScheme);
      if (f[1]) setFontScaleState(f[1] as FontScale);
    })();
  }, []);

  // NativeWind 의 colorScheme API 로 다크 클래스를 토글한다.
  useEffect(() => {
    try {
      nwColorScheme.set(scheme);
    } catch {
      // SDK/플랫폼별 미지원 시 무시 — 시스템 설정이 적용됨.
    }
  }, [scheme]);

  const setScheme = useCallback((s: ColorScheme) => {
    setSchemeState(s);
    void AsyncStorage.setItem(SCHEME_KEY, s);
  }, []);

  const setFontScale = useCallback((f: FontScale) => {
    setFontScaleState(f);
    void AsyncStorage.setItem(FONT_KEY, f);
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

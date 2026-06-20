import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "contrast";
export type FontChoice = "default" | "dyslexia";
export type TextSize = "s" | "m" | "l" | "xl";
export type Motion = "full" | "reduced";

export interface A11ySettings {
  theme: Theme;
  font: FontChoice;
  textSize: TextSize;
  motion: Motion;
  ruler: boolean;
}

const DEFAULTS: A11ySettings = {
  theme: "light",
  font: "default",
  textSize: "m",
  motion: "full",
  ruler: false,
};

const STORAGE_KEY = "subtext.a11y";

interface Ctx extends A11ySettings {
  set: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  reset: () => void;
}

const AccessibilityContext = createContext<Ctx | null>(null);

function load(): A11ySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<A11ySettings>) };
  } catch {
    return DEFAULTS;
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(load);

  // Reflect settings onto <html> so CSS variables/selectors apply globally.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.font = settings.font;
    root.dataset.textsize = settings.textSize;
    root.dataset.motion = settings.motion;
    root.dataset.ruler = settings.ruler ? "on" : "off";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota / private mode */
    }
  }, [settings]);

  const value = useMemo<Ctx>(
    () => ({
      ...settings,
      set: (key, val) => setSettings((s) => ({ ...s, [key]: val })),
      reset: () => setSettings(DEFAULTS),
    }),
    [settings],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useA11y(): Ctx {
  const ctx = useContext(AccessibilityContext);
  if (!ctx)
    throw new Error("useA11y must be used within an AccessibilityProvider");
  return ctx;
}

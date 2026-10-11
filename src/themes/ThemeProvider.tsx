import React, { createContext, useContext, useEffect, useState } from 'react';
import defaultTheme from './default_theme.json';
import { ThemeConfig } from './types';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme as ThemeConfig,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme as ThemeConfig);

  useEffect(() => {
    const root = document.documentElement;
    const { colors } = theme;

    root.style.setProperty('--color-bg-primary', colors.bgPrimary);
    root.style.setProperty('--color-bg-secondary', colors.bgSecondary);
    root.style.setProperty('--color-bg-surface', colors.bgSurface);
    root.style.setProperty('--color-bg-hover', colors.bgHover);

    root.style.setProperty('--color-border-subtle', colors.borderSubtle);
    root.style.setProperty('--color-border-highlight', colors.borderHighlight);

    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-muted', colors.textMuted);

    root.style.setProperty('--color-hope', colors.hope);
    root.style.setProperty('--color-hope-light', colors.hopeLight);
    root.style.setProperty('--color-hope-dark', colors.hopeDark);

    root.style.setProperty('--color-fear', colors.fear);
    root.style.setProperty('--color-fear-light', colors.fearLight);
    root.style.setProperty('--color-fear-dark', colors.fearDark);

    root.style.setProperty('--color-domain-arcana', colors.domainArcana);
    root.style.setProperty('--color-domain-blade', colors.domainBlade);
    root.style.setProperty('--color-domain-bone', colors.domainBone);
    root.style.setProperty('--color-domain-codex', colors.domainCodex);
    root.style.setProperty('--color-domain-dread', colors.domainDread);
    root.style.setProperty('--color-domain-grace', colors.domainGrace);
    root.style.setProperty('--color-domain-midnight', colors.domainMidnight);
    root.style.setProperty('--color-domain-sage', colors.domainSage);
    root.style.setProperty('--color-domain-splendor', colors.domainSplendor);
    root.style.setProperty('--color-domain-valor', colors.domainValor);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

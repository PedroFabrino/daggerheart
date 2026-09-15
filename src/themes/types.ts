export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgSurface: string;
  bgHover: string;
  borderSubtle: string;
  borderHighlight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  hope: string;
  hopeLight: string;
  hopeDark: string;
  fear: string;
  fearLight: string;
  fearDark: string;
  domainArcana: string;
  domainBlade: string;
  domainBone: string;
  domainCodex: string;
  domainGrace: string;
  domainMidnight: string;
  domainSage: string;
  domainSplendor: string;
  domainValor: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
}

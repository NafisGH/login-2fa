import { ThemeProvider as SCThemeProvider } from "styled-components";
import { type PropsWithChildren } from "react";

const theme = {
  colors: {
    bg: "#ffffff",
    text: "#111827",
    muted: "#6B7280",
    border: "#E5E7EB",
    primary: "#1E66F5",
    primaryText: "#ffffff",
    danger: "#EF4444",
    inputFocus: "#3B82F6",
  },
  radius: {
    lg: "12px",
    md: "8px",
    sm: "6px",
  },
  shadow: {
    card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)",
    focus: "0 0 0 3px rgba(59, 130, 246, 0.35)",
  },
  version: "1.0.0",
};

export type AppTheme = typeof theme;

declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {
    version: string;
  }
}

export default function ThemeProvider({ children }: PropsWithChildren) {
  return <SCThemeProvider theme={theme}>{children}</SCThemeProvider>;
}

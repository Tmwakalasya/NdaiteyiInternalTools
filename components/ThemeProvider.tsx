"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Wraps the app so the light/dark choice is remembered and can follow the
// device setting. Toggles a `.dark` class on <html>.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

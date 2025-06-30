"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NotificationProvider } from "@/components/context/NotificationContext";
import { ToastProvider } from "@/components/context/ToastContext";
import { MyContextProvider } from "@/utils/Context";

export function Providers({ children, themeProps }) {
  return (
    <MyContextProvider>
      <HeroUIProvider>
        <NextThemesProvider
          defaultTheme="system"
          attribute="class"
          enableSystem={true}
          enableColorScheme={true}
          storageKey="sintesa-theme"
          {...themeProps}
        >
          <NotificationProvider>
            <ToastProvider>{children}</ToastProvider>
          </NotificationProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </MyContextProvider>
  );
}

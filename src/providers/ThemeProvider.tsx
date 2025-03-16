'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

export function ThemeProvider({
    children,
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            attribute='class' // Use "class" to switch themes
            value={{
                light: 'light',
                dark: 'dark',
                sun: 'sun', // Add custom themes here
            }}
            defaultTheme='light'
        >
            {children}
        </NextThemesProvider>
    );
}

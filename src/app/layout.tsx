import type { Metadata } from 'next';
import { Inter, Roboto_Mono, Work_Sans } from 'next/font/google';
import './globals.css';
// import "./styles/custom.css";
// import "./styles/slide.css";
import ReduxProvider from '@/providers/ReduxProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from 'sonner';
import 'simplebar-react/dist/simplebar.min.css';
import AllProvider from '@/providers/AllProvider';
import WorkspaceProvider from '@/providers/WorkspaceProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import MainLayout from '@/components/Layout/MainLayout';

const interFont = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

const robotoMonoFont = Roboto_Mono({
    variable: '--font-roboto-mono',
    subsets: ['latin'],
});

const workSansFont = Work_Sans({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: 'BootcampsHub Portal',
    description:
        'Monitor your progress and activities in the Bootcamps Hub dashboard.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <html lang='en' suppressHydrationWarning>
                <body
                    className={`${workSansFont.className} ${interFont.variable} ${robotoMonoFont.variable} no-scrollbar relative min-h-screen bg-foreground antialiased`}
                >
                    <ThemeProvider
                        attribute='class'
                        defaultTheme='system'
                        enableSystem
                        disableTransitionOnChange
                    >
                        <ReduxProvider>
                            <AllProvider>
                                <WorkspaceProvider>
                                    <SidebarProvider>
                                        <MainLayout>
                                            {children}
                                            <Toaster
                                                richColors
                                                position='top-center'
                                            />
                                        </MainLayout>
                                    </SidebarProvider>
                                </WorkspaceProvider>
                            </AllProvider>
                        </ReduxProvider>
                    </ThemeProvider>
                </body>
            </html>
        </>
    );
}

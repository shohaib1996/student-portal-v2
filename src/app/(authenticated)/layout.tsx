import MainLayout from '@/components/Layout/MainLayout';
import { SidebarProvider } from '@/components/ui/sidebar';
import AllProvider from '@/providers/AllProvider';
import WorkspaceProvider from '@/providers/WorkspaceProvider';
import { ReactNode, Suspense } from 'react';

export default async function AuthLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <AllProvider>
            <WorkspaceProvider>
                <SidebarProvider>
                    <MainLayout>{children}</MainLayout>
                </SidebarProvider>
            </WorkspaceProvider>
        </AllProvider>
    );
}

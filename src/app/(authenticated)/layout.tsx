'use client';
import AppSidebar from '@/components/shared/AppSidebar';
import SelectActiveCompany from '@/components/shared/SelectActiveCompany';
import { SidebarProvider } from '@/components/ui/sidebar';
import CookiesHandler from '@/lib/axios/CookiesHandler';
import AllProvider from '@/providers/AllProvider';
import WorkspaceProvider from '@/providers/WorkspaceProvider';
import { ReactNode } from 'react';
import Cookies from 'js-cookie';

export default async function MainLayout({
    children,
}: {
    children: ReactNode;
}) {
    const activeCompany = Cookies.get('activeCompany');

    console.log(activeCompany);

    return (
        <AllProvider>
            <WorkspaceProvider>
                <SidebarProvider>
                    {activeCompany ? (
                        <>
                            <AppSidebar />
                            <main className='mx-auto max-w-[1300px] p-common pt-0 md:p-common 2xl:p-0 2xl:pb-common'>
                                {children}
                            </main>
                        </>
                    ) : (
                        <SelectActiveCompany />
                    )}
                </SidebarProvider>
            </WorkspaceProvider>
        </AllProvider>
    );
}

import AppSidebar from '@/components/shared/AppSidebar';
import SelectActiveCompany from '@/components/shared/SelectActiveCompany';
import { SidebarProvider } from '@/components/ui/sidebar';
import CookiesHandler from '@/lib/axios/CookiesHandler';
import AllProvider from '@/providers/AllProvider';
import { ReactNode } from 'react';

export default async function MainLayout({
    children,
}: {
    children: ReactNode;
}) {
    const activeCompany = await CookiesHandler(
        'get',
        process.env.NEXT_PUBLIC_AUTH_ACTIVE_COMPANY_NAME as string,
    );

    return (
        <AllProvider>
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
        </AllProvider>
    );
}

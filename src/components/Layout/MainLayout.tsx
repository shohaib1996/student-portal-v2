'use client';
import React, { ReactNode } from 'react';
import { AppSidebar } from '../shared/AppSidebar';
import SelectActiveCompany from '../shared/SelectActiveCompany';
import Cookies from 'js-cookie';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from '../ui/sidebar';
import Navbar from '../shared/Navbar';

const MainLayout = ({ children }: { children: ReactNode }) => {
    const activeCompany = Cookies.get('activeCompany');
    const { state } = useSidebar();
    return (
        <>
            {activeCompany ? (
                <>
                    <AppSidebar />
                    <SidebarInset>
                        <main className={`relative bg-background w-full`}>
                            <Navbar />
                            <div className='px-2 min-h-[calc(100vh-55px)]'>
                                {children}
                            </div>
                        </main>
                    </SidebarInset>
                </>
            ) : (
                <SelectActiveCompany />
            )}
        </>
    );
};

export default MainLayout;

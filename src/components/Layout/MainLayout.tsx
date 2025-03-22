'use client';
import React, { ReactNode } from 'react';
import { AppSidebar } from '../shared/AppSidebar';
import SelectActiveCompany from '../shared/SelectActiveCompany';
import Cookies from 'js-cookie';
import { SidebarInset, useSidebar } from '../ui/sidebar';
import Navbar from '../shared/Navbar';
import ChatPopup from '../chat/PopUpChat/ChatPopup';
import { usePathname } from 'next/navigation';

const MainLayout = ({ children }: { children: ReactNode }) => {
    const activeCompany = Cookies.get('activeCompany');
    const { state } = useSidebar();
    const pathName = usePathname();
    console.log({ pathName });
    const isChat = pathName.includes('/chat') ? true : false;

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
                    {!isChat && <ChatPopup />}
                </>
            ) : (
                <SelectActiveCompany />
            )}
        </>
    );
};

export default MainLayout;

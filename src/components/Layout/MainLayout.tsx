'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { AppSidebar } from '../shared/AppSidebar';
import SelectActiveCompany from '../shared/SelectActiveCompany';
import Cookies from 'js-cookie';
import { SidebarInset, useSidebar } from '../ui/sidebar';
import Navbar from '../shared/Navbar';
import ChatPopup from '../chat/PopUpChat/ChatPopup';
import { usePathname } from 'next/navigation';
import ChatModalsWrapper from '../chat/PopUpChat/ChatModalsWrapper';
import { useAppSelector } from '@/redux/hooks';
import setupSocketListeners from '@/helper/socketHandler';
import { socket } from '@/helper/socketManager';
import { EventPopoverProvider } from '../calendar/CreateEvent/EventPopover';

const MainLayout = ({ children }: { children: ReactNode }) => {
    const activeCompany = Cookies.get('activeCompany');
    const { user } = useAppSelector((state) => state.auth);
    const { state } = useSidebar();
    const pathName = usePathname();
    const isChat = pathName.includes('/chat') ? true : false;
    useEffect(() => {
        if (user?._id) {
            // Clean up listeners or any other resources here if needed
            const cleanUpListeners = setupSocketListeners();
            return cleanUpListeners;
        }
    }, [socket]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            {activeCompany ? (
                <>
                    <AppSidebar />
                    <main
                        className={`relative bg-background ${state === 'expanded' ? 'md:w-[calc(100%-256px)]' : 'md:w-[calc(100%-48px)]'} w-full`}
                    >
                        <Navbar />
                        <div className='px-2 min-h-[calc(100vh-55px)]'>
                            {children}
                        </div>
                    </main>
                    {!isChat && (
                        <ChatModalsWrapper>
                            <ChatPopup />
                        </ChatModalsWrapper>
                    )}
                </>
            ) : (
                <SelectActiveCompany />
            )}
        </>
    );
};

export default MainLayout;

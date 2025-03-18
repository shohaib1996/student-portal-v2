'use client';
import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import ChatNav from '../../../../components/chat/ChatNav';
import { Loader2 } from 'lucide-react';
import Inbox from '@/components/chat/Inbox';

// Dynamic imports
const ProfileInfo = lazy(
    () => import('../../../../components/chat/ProfileInfo'),
);
const ProfileInfoModal = lazy(
    () =>
        import('../../../../components/chat/ProfileInfoModal/ProfileInfoModal'),
);

// Loading fallback component
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
);

const ChatInbox = () => {
    const [profileInfoShow, setProfileInfoShow] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [reloading, setReloading] = useState(false);

    const handleToggleProfileInfo = useCallback(() => {
        const screenSize = window.innerWidth;
        if (screenSize > 992) {
            setProfileInfoShow((state) => !state);
        } else {
            setModalOpen(true);
        }
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
    }, []);
    console.log(
        '----------------------------------------------------------------------------------------',
    );
    return (
        <div className='flex flex-col min-h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] h-[calc(100vh-60px)]'>
            <div className='flex-1 bg-background h-full'>
                <div className='container h-full w-full'>
                    <div className='grid grid-cols-1 lg:grid-cols-12 h-full'>
                        {/* Chat Navigation */}
                        <div className='lg:col-span-4 lg:col-start-1 col-span-12 h-full'>
                            <ChatNav reloading={reloading} />
                        </div>

                        {/* Chat Inbox */}
                        <div
                            className={`col-span-12 ${profileInfoShow ? 'lg:col-span-4' : 'lg:col-span-8 lg:col-start-5'}`}
                        >
                            <Inbox
                                handleToggleInfo={handleToggleProfileInfo}
                                profileInfoShow={profileInfoShow}
                                setProfileInfoShow={setProfileInfoShow}
                                setReloading={setReloading}
                                reloading={reloading}
                            />
                        </div>

                        {/* Profile Info (visible on larger screens when toggled) */}
                        {profileInfoShow && (
                            <div className='lg:col-span-4 col-span-12'>
                                <Suspense fallback={<LoadingFallback />}>
                                    <ProfileInfo
                                        handleToggleInfo={
                                            handleToggleProfileInfo
                                        }
                                    />
                                </Suspense>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Info Modal (for mobile) */}
            <Suspense fallback={null}>
                <ProfileInfoModal opened={modalOpen} close={closeModal} />
            </Suspense>
        </div>
    );
};

export default ChatInbox;

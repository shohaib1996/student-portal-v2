'use client';

import { useState, useCallback, Suspense, lazy } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Inbox from '@/components/chat/Inbox';
import ChatNav from '@/components/chat/ChatNav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { EventPopoverProvider } from '@/components/calendar/CreateEvent/EventPopover';
import CreateEventModal from '@/components/calendar/CreateEvent/CreateEventModal';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Dynamic imports
const ChatInfo = lazy(() => import('@/components/chat/ChatInfo'));

// Loading fallback component
const LoadingFallback = () => (
    <div className='flex items-center justify-center p-4'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
);

export default function ChatPage() {
    const [profileInfoShow, setProfileInfoShow] = useState(false);
    const [reloading, setReloading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const chatId = params?.chatid;

    const handleToggleProfileInfo = useCallback(() => {
        setProfileInfoShow((state) => !state);
    }, []);

    const handleBackToList = useCallback(() => {
        router.push('/chat');
    }, [router]);

    return (
        <EventPopoverProvider>
            <div className='flex flex-col min-h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] h-[calc(100vh-60px)]'>
                <div className='flex-1 bg-background h-full'>
                    <div className='h-full w-full'>
                        <div className='grid grid-cols-1 lg:grid-cols-12 h-full'>
                            {/* Chat Navigation - Hidden on small screens when chat is selected */}
                            <div
                                className={`${chatId ? 'hidden lg:block' : ''} lg:col-span-4 3xl:col-span-3 col-span-12 h-full`}
                            >
                                <ChatNav reloading={reloading} />
                            </div>

                            {/* Chat Inbox */}
                            <div
                                className={`col-span-12 ${chatId ? 'block' : 'hidden lg:block'} lg:col-span-8 3xl:col-span-9 h-full`}
                            >
                                {/* Back button - Only visible on small screens when chat is selected
                                {chatId && (
                                    <div className='p-2 border-b lg:hidden'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={handleBackToList}
                                            className='flex items-center gap-2'
                                        >
                                            <ArrowLeft className='h-4 w-4' />
                                            <span>Back to chats</span>
                                        </Button>
                                    </div>
                                )} */}

                                <Inbox
                                    handleToggleInfo={handleToggleProfileInfo}
                                    profileInfoShow={profileInfoShow}
                                    setProfileInfoShow={setProfileInfoShow}
                                    setReloading={setReloading}
                                    reloading={reloading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Info as a right-side drawer */}
                <Sheet open={profileInfoShow} onOpenChange={setProfileInfoShow}>
                    <SheetContent
                        className='w-full sm:min-w-[500px] sm:w-[500px] md:min-w-[600px] md:w-[600px] p-0 border-l'
                        side='right'
                    >
                        <Suspense fallback={<LoadingFallback />}>
                            <ChatInfo
                                handleToggleInfo={handleToggleProfileInfo}
                                chatId={chatId as string}
                            />
                        </Suspense>
                    </SheetContent>
                </Sheet>
            </div>
            <CreateEventModal />
        </EventPopoverProvider>
    );
}

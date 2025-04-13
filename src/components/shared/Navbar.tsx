'use client';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import {
    Bell,
    BellDot,
    Calendar,
    Captions,
    ChevronDown,
    Globe,
    MessageSquareDot,
    MessageSquareMore,
    GraduationCap,
    Menu,
    Moon,
    PanelRightOpen,
    Search,
    Settings,
    Sun,
    UserRound,
    CircleDollarSign,
    ScrollText,
    LogOut,
    BookOpenText,
    MessageCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Cookies from 'js-cookie';
import Link from 'next/link';
import NotificationMenu from './NotificationMenu';
import { useTheme } from 'next-themes';
import GlobalDropdown, { DropdownItems } from '../global/GlobalDropdown';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitialsFromName } from '@/utils/common';
import CourseSectionOpenButton from '../global/SelectModal/buttons/course-section-open-button';
import { useRouter } from 'nextjs-toploader/app';
import Image from 'next/image';
import { SidebarTrigger } from '../ui/sidebar';
import { persistor } from '@/redux/store';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

const Navbar = () => {
    const dispatch = useAppDispatch();
    const { companies, features, companySwitcher } = useAppSelector(
        (state) => state.company,
    );
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    const activeCompany = Cookies.get('activeCompany');
    const isChatAvailable = features?.find((f) => f.key === 'chat');
    const isCalendarAvailable = features?.find((f) => f.key === 'calendar');
    const { theme, setTheme } = useTheme();
    const { user } = useAppSelector((s) => s.auth);
    const [unread, setUnread] = useState<any[]>([]);
    const navigations = useAppSelector((state) => state.navigations);
    const { chats = [] } = useAppSelector((state) => state.chat);
    useEffect(() => {
        const channels =
            chats?.filter(
                (x: any) => x?.isChannel && (x?.unreadCount ?? 0) > 0,
            ) || [];
        setUnread(channels);
    }, [chats]);

    const handleLogout = () => {
        Cookies.remove(process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string, {
            domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        });
        persistor.purge();
        window.location.href = process.env.NEXT_PUBLIC_REDIRECT_URL as string;
    };
    const commingSoon = () => {
        toast.success('Coming Soon...');
    };
    const dropdownItems: DropdownItems[] = [
        {
            id: 2,
            content: (
                <Link
                    href='/profile?tab=profile-settings'
                    className='flex gap-2 text-dark-gray items-center hover:underline hover:bg-background hover:rounded-lg'
                >
                    <UserRound size={18} />
                    My Profile
                </Link>
            ),
        },
        {
            id: 743,
            content: (
                <Link
                    href='/profile?tab=change-password'
                    className='flex gap-2 text-dark-gray items-center hover:underline hover:bg-background hover:rounded-lg'
                >
                    <BookOpenText size={18} />
                    Change Password
                </Link>
            ),
        },
        // {
        //     id: 3,
        //     content: (
        //         <Link
        //             href='/payment-history'
        //             className='flex gap-2 text-dark-gray items-center cursor-pointer'
        //         >
        //             <CircleDollarSign size={18} />
        //             Payments
        //         </Link>
        //     ),
        // },
        {
            id: 343,
            content: (
                <Link
                    href='/aggrements'
                    className='flex gap-2 text-dark-gray items-center cursor-pointer'
                >
                    <ScrollText size={18} />
                    Aggrements
                </Link>
            ),
        },
        {
            id: 98,
            content: (
                <Link
                    href='#'
                    onClick={commingSoon}
                    className='flex gap-2 text-dark-gray items-center cursor-pointer'
                >
                    <Bell size={18} />
                    User Manual
                </Link>
            ),
        },
        {
            id: 6,
            content: (
                <Link
                    href='/notification-preferences'
                    className='flex gap-2 text-dark-gray items-center cursor-pointer'
                >
                    <BellDot size={18} />
                    Notification Preferences
                </Link>
            ),
        },
        {
            id: 8,
            content: (
                <Button className='md:hidden' variant={'primary_light'}>
                    <Link href='/docs' target='_blank'>
                        Manual
                    </Link>
                </Button>
            ),
        },
        {
            id: 121,
            content: (
                <div className='flex justify-between'>
                    <Button
                        className='rounded-full sm:hidden  size-9 text-dark-gray'
                        variant={'outline'}
                        onClick={() =>
                            setTheme(theme === 'dark' ? 'light' : 'dark')
                        }
                    >
                        {theme === 'dark' ? (
                            <Moon size={18} />
                        ) : (
                            <Sun size={18} />
                        )}
                    </Button>
                    <Button
                        variant={'danger_light'}
                        className='w'
                        onClick={() => handleLogout()}
                    >
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>
            ),
        },
    ].filter(Boolean);

    const [searchOpen, setSearchOpen] = useState(false);

    const permissions: { route: string; id: string; label: string }[] = [];

    if (navigations.myProgram) {
        permissions.push({
            route: '/program',
            label: 'My Program',
            id: 'myProgram',
        });
    }
    if (navigations.myE2eProgramAgenda) {
        permissions.push({
            route: '/e2e-program-agenda',
            label: 'E2E Program Agenda',
            id: 'myE2eProgramAgenda',
        });
    }
    if (navigations.myPurchasedItem) {
        permissions.push({
            route: '/program/online-courses',
            label: 'Online Courses',
            id: 'myPurchasedItem',
        });
    }
    if (navigations.myMedia) {
        permissions.push({
            route: '/audio-video',
            label: 'Audios/Videos',
            id: 'myMedia',
        });
    }
    if (navigations.showTell) {
        permissions.push({
            route: '/show-n-tell',
            label: 'Show & Tell',
            id: 'showTell',
        });
    }

    if (navigations.technicalTest) {
        permissions.push({
            route: '/dashboard/technical-tests',
            label: 'Technical Test',
            id: 'technicalTest',
        });
    }
    if (navigations.myDocument) {
        permissions.push({
            route: '/my-documents',
            label: 'My Documents',
            id: 'myDocument',
        });
    }
    if (navigations.myUploadedDocument) {
        permissions.push({
            route: '/upload-documents',
            label: 'Uploaded Documents',
            id: 'myUploadedDocument',
        });
    }
    if (navigations.template) {
        permissions.push({
            route: '/my-templates',
            label: 'Templates',
            id: 'template',
        });
    }
    if (navigations.myCalendar) {
        permissions.push({
            route: '/calendar',
            label: 'Calendar',
            id: 'calendar',
        });
        permissions.push({
            route: '/calendar/events',
            label: 'Events',
            id: 'Events',
        });
        permissions.push({
            route: '/calendar/to-do',
            label: 'To-Do',
            id: 'To-Do',
        });
    }
    if (navigations.myMockInterview) {
        permissions.push({
            route: '/mock-interviews',
            label: 'Mock Interview',
            id: 'myMockInterview',
        });
    }

    if (navigations.myJobSupport) {
        permissions.push({
            route: '/my-job-support',
            label: 'Job Support',
            id: 'myJobSupport',
        });
    }
    if (navigations.family) {
        permissions.push({
            route: '/my-family',
            label: 'Family',
            id: 'family',
        });
    }
    if (navigations.myIssue) {
        permissions.push({
            route: '/my-issues',
            label: 'My Issues',
            id: 'myIssue',
        });
    }

    const [filteredData, setFilteredData] = useState<
        { route: string; id: string; label: string }[]
    >([]);
    const [wordEntered, setWordEntered] = useState('');

    const handleFilter = (event: ChangeEvent<HTMLInputElement>) => {
        const searchWord = event.target.value;
        setWordEntered(searchWord);
        const newFilter = permissions.filter((value) =>
            value?.label?.toLowerCase().includes(searchWord.toLowerCase()),
        );

        if (searchWord === '') {
            setFilteredData([]);
        } else {
            setFilteredData(newFilter);
        }
    };

    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchRef.current && filteredData.length > 0) {
                if (!searchRef.current.contains(e.target as Node)) {
                    setFilteredData([]);
                }
            }
        };
        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, []);

    const [userOpen, setUserOpen] = useState(false);
    const pathName = usePathname();

    // useEffect(() => {
    //     setUserOpen(false);
    // }, [pathName, router]);

    return (
        <div className='sticky top-0 z-20 flex flex-shrink-0 w-full h-[55px] box-border bg-foreground border-b border-forground-border shadow-sm'>
            <div className='flex gap-2 relative justify-between w-full h-full items-center px-2'>
                <div
                    className='relative flex gap-1 items-center'
                    ref={searchRef}
                >
                    <SidebarTrigger></SidebarTrigger>
                    <Input
                        className='h-9 rounded-full md:w-[390px] md:inline-flex hidden w-9 text-dark-gray'
                        placeholder='Search here'
                        prefix={<Search size={18} />}
                        value={wordEntered}
                        onChange={handleFilter}
                    />
                    {filteredData.length > 0 && (
                        <div className='absolute flex flex-col gap-2 bg-foreground border border-forground-border shadow-md w-full rounded-md top-10 z-40 p-2'>
                            {filteredData?.map((item) => (
                                <Link key={item.id} href={item.route}>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className='flex aspect-square md:hidden items-center justify-center'>
                    <Image
                        src={theme === 'dark' ? '/logo.png' : '/logo-blue.png'}
                        width={120}
                        height={30}
                        alt='logo'
                    />
                </div>
                <div className='flex xl:gap-3 md:gap-2 gap-1 items-center'>
                    {/* <Button
                        onClick={() => setSearchOpen((prev) => !prev)}
                        className='rounded-full size-9 text-dark-gray md:hidden'
                        variant={'outline'}
                        icon={<Search size={18} />}
                    /> */}

                    <CourseSectionOpenButton
                        icon={
                            <GraduationCap
                                className='text-dark-gray'
                                size={18}
                            />
                        }
                    />

                    <Button
                        className='md:block hidden'
                        variant={'primary_light'}
                    >
                        <Link href='/docs' target='_blank'>
                            Manual
                        </Link>
                    </Button>
                    <Button
                        className='rounded-full  size-9 text-dark-gray'
                        variant={'outline'}
                    >
                        <Link href='/chat'>
                            <MessageCircle size={18} />
                        </Link>
                    </Button>
                    <Button
                        className='rounded-full  size-9 text-dark-gray'
                        variant={'outline'}
                        onClick={() =>
                            setTheme(theme === 'dark' ? 'light' : 'dark')
                        }
                    >
                        {theme === 'dark' ? (
                            <Moon size={18} />
                        ) : (
                            <Sun size={18} />
                        )}
                    </Button>
                    {/* {isAuthenticated && isChatAvailable && (
                        <>
                            <div
                                onClick={() => router.push('/chat')}
                                className={`text-dark-gray cursor-pointer h-12 w-8 flex items-center justify-center rounded-md duration-200`}
                            >
                                <div className='relative'>
                                    <Button
                                        variant={'outline'}
                                        size={'icon'}
                                        className='rounded-full text-dark-gray'
                                    >
                                        <MessageSquareMore size={18} />
                                    </Button>
                                    {unread.length > 0 && (
                                        <>
                                            <span className='absolute -top-0 -right-0 h-2.5 w-2.5 rounded-full bg-red-500'></span>
                                            <span className='absolute -top-0 -right-0 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping'></span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )} */}
                    {isAuthenticated && isCalendarAvailable && (
                        <>
                            <Button
                                variant={'outline'}
                                size={'icon'}
                                className='rounded-full text-dark-gray'
                                onClick={() => router.push('/calendar')}
                            >
                                <Calendar size={18} />
                            </Button>
                            <NotificationMenu />
                        </>
                    )}
                    <GlobalDropdown
                        open={userOpen}
                        items={dropdownItems}
                        onOpenChange={(val) => setUserOpen(val)}
                        title={
                            <div className='flex items-center gap-3'>
                                <Avatar className='h-12 w-12 cursor-pointer'>
                                    <AvatarImage src={user?.profilePicture} />
                                    <AvatarFallback>
                                        {getInitialsFromName(
                                            user?.fullName || '',
                                        )}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <p className='text-black text-base'>
                                        {user?.fullName}
                                    </p>
                                    <p className='text-dark-gray text-sm'>
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                        }
                    >
                        <Avatar
                            onClick={() => setUserOpen((prev) => !prev)}
                            className='h-9 w-9 cursor-pointer'
                        >
                            <AvatarImage
                                className='size-9'
                                src={user?.profilePicture}
                            />
                            <AvatarFallback>
                                {getInitialsFromName(user?.fullName || '')}
                            </AvatarFallback>
                        </Avatar>
                    </GlobalDropdown>
                    {/* <SidebarTrigger className='md:hidden text-dark-gray'>
                        <Menu size={18} />
                    </SidebarTrigger> */}
                </div>

                {searchOpen && (
                    <div className='absolute md:hidden shadow-md px-2 bg-foreground flex items-center top-[52px] left-0 w-full h-9 z-[999999]'>
                        <Input
                            className='h-7 bg-background rounded-full w-full  text-dark-gray'
                            placeholder='Search here'
                            prefix={<Search size={18} />}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;

'use client';
import React from 'react';
import { Input } from '../ui/input';
import {
    Bell,
    BellDot,
    Calendar,
    Captions,
    ChevronDown,
    Globe,
    Moon,
    Search,
    Settings,
    Sun,
    UserRound,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCompanySwitcher } from '@/redux/features/comapnyReducer';
import Cookies from 'js-cookie';
import Link from 'next/link';
import NotificationMenu from './NotificationMenu';
import { useTheme } from 'next-themes';
import GlobalDropdown, { DropdownItems } from '../global/GlobalDropdown';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitialsFromName } from '@/utils/common';
import CourseSectionOpenButton from '../global/SelectModal/course-section-open-button';

const Navbar = () => {
    const dispatch = useAppDispatch();
    const { companies, features, companySwitcher } = useAppSelector(
        (state) => state.company,
    );
    const { isAuthenticated } = useAppSelector((s) => s.auth);
    const activeCompany = Cookies.get('activeCompany');
    const isChatAvailable = features?.find((f) => f.key === 'chat');
    const isCalendarAvailable = features?.find((f) => f.key === 'calendar');

    const { theme, setTheme } = useTheme();
    const { user } = useAppSelector((s) => s.auth);

    const dropdownItems: DropdownItems[] = [
        {
            id: 2,
            content: (
                <Link
                    href='/profile'
                    className='flex gap-2 text-dark-gray items-center'
                >
                    <UserRound size={18} />
                    My Profile
                </Link>
            ),
        },
        {
            id: 3,
            content: (
                <Link
                    href='/branch-settings'
                    className='flex gap-2 text-dark-gray items-center'
                >
                    <Settings size={18} />
                </Link>
            ),
        },
        {
            id: 4,
            content: (
                <Link
                    href='/notification-setting'
                    className='flex gap-2 text-dark-gray items-center'
                >
                    <Bell size={18} />
                    Notification Settings
                </Link>
            ),
        },
        {
            id: 4,
            content: (
                <Link
                    href='/menu-builder'
                    className='flex gap-2 text-dark-gray items-center'
                >
                    <Bell size={18} />
                    Menu Builder
                </Link>
            ),
        },
        {
            id: 6,
            content: (
                <Link
                    href='/notification-preferences'
                    className='flex gap-2 text-dark-gray items-center'
                >
                    <BellDot size={18} />
                    Notification Preferences
                </Link>
            ),
        },
        {
            id: 7,
            content: (
                <Link
                    href='/transcription'
                    className='flex gap-2 text-dark-gray items-center'
                >
                    <Captions size={18} />
                    Transcription AI
                </Link>
            ),
        },
    ].filter(Boolean);

    return (
        <div className='sticky top-0 z-20 flex flex-shrink-0 w-full h-[55px] box-border bg-sidebar'>
            <div className='flex justify-between w-full h-full items-center px-2'>
                <Input
                    className='h-9 rounded-full lg:w-[390px] text-dark-gray'
                    placeholder='Search here'
                    prefix={<Search size={18} />}
                />
                <div className='flex gap-4 items-center'>
                    {/* <Button
                        variant={'secondary'}
                        className='rounded-full  text-dark-gray max-w-[200px]'
                        onClick={() => dispatch(setCompanySwitcher(true))}
                    >
                        <p className='truncate w-full'>
                            {companies?.find((c) => c._id === activeCompany)
                                ?.name || 'Select Company'}
                        </p>
                        <p>
                            <ChevronDown size={16} />
                        </p>
                    </Button> */}

                    <CourseSectionOpenButton />

                    <Button variant={'primary_light'}>
                        <Link href='/docs' target='_blank'>
                            Manual
                        </Link>
                    </Button>
                    <div className='border-none flex gap-1 h-full items-center text-dark-gray'>
                        <p>
                            <Globe size={16} />
                        </p>
                        <p>English</p>
                        <p>
                            <ChevronDown size={16} />
                        </p>
                    </div>
                    <div
                        className='border-none flex gap-1 h-full items-center text-dark-gray cursor-pointer'
                        onClick={() =>
                            setTheme(theme === 'dark' ? 'light' : 'dark')
                        }
                    >
                        {theme === 'dark' ? (
                            <Moon size={18} />
                        ) : (
                            <Sun size={18} />
                        )}
                    </div>
                    {isAuthenticated && isCalendarAvailable && (
                        <>
                            <Button
                                variant={'secondary'}
                                size={'icon'}
                                className='rounded-full text-dark-gray'
                            >
                                <Calendar size={18} />
                            </Button>
                            <NotificationMenu />
                        </>
                    )}
                    <GlobalDropdown
                        items={dropdownItems}
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
                        <Avatar className='h-9 w-9 cursor-pointer'>
                            <AvatarImage
                                className='size-9'
                                src={user?.profilePicture}
                            />
                            <AvatarFallback>
                                {getInitialsFromName(user?.fullName || '')}
                            </AvatarFallback>
                        </Avatar>
                    </GlobalDropdown>
                </div>
            </div>
        </div>
    );
};

export default Navbar;

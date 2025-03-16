'use client';

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
    ChevronRight,
    FolderOpen,
    GalleryVerticalEnd,
    Search,
} from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { useRouter } from 'nextjs-toploader/app';

export type TLoookup = {
    data: any;
    id: string;
    parent: number | string;
    text?: string;
    children: TLoookup[];
};

export function AppSidebar() {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [wordEntered, setWordEntered] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    // Helper function to convert text to title case
    function toTitleCase(str: string | undefined): string {
        if (!str) {
            return '';
        }

        return str
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    if (!isAuthenticated) {
        return <></>;
    }
    const getPathName = () => {
        const parts = pathname?.split('/').filter(Boolean); // Remove empty strings

        return parts.length > 0 ? parts[parts.length - 1] : '';
    };

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

    const { theme } = useTheme();

    return (
        <Sidebar collapsible='icon'>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size='lg'>
                            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                                <GalleryVerticalEnd className='size-4' />
                            </div>
                            <Link href={`/dashboard`}>
                                <div className='flex flex-col gap-0.5 leading-none'>
                                    <Image
                                        src={
                                            theme !== 'dark'
                                                ? '/logo/logo.png'
                                                : '/logo/logo-white.png'
                                        }
                                        width={140}
                                        height={40}
                                        alt='logo'
                                    />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <div className='relative' ref={searchRef}>
                            {/* <Input
                                value={wordEntered}
                                onChange={handleFilter}
                                className='bg-background text-dark-gray h-9'
                                prefix={<Search size={18} />}
                            /> */}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {/* zoom */}
                                <SidebarMenuItem>
                                    <Collapsible className='group/collapsible'>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={'Zoom'}>
                                                <FolderOpen size={22} />
                                                <h2 className='whitespace-nowrap truncate'>
                                                    Zoom
                                                </h2>
                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuButton
                                                        className={cn(
                                                            pathname.includes(
                                                                'meetings',
                                                            )
                                                                ? 'hover:bg-transparent hover:text-pure-white bg-sidebar-primary text-pure-white'
                                                                : '',
                                                        )}
                                                        asChild
                                                    >
                                                        <div className='flex items-center gap-1'>
                                                            <FolderOpen
                                                                size={22}
                                                            />
                                                            <Link
                                                                className='whitespace-nowrap truncate w-full'
                                                                href={
                                                                    '/zoom/meetings'
                                                                }
                                                            >
                                                                Meetings
                                                            </Link>
                                                        </div>
                                                    </SidebarMenuButton>
                                                    <SidebarMenuButton
                                                        className={cn(
                                                            pathname.includes(
                                                                'recordings',
                                                            )
                                                                ? 'hover:bg-transparent hover:text-pure-white bg-sidebar-primary text-pure-white'
                                                                : '',
                                                        )}
                                                        asChild
                                                    >
                                                        <div className='flex items-center gap-1'>
                                                            <FolderOpen
                                                                size={22}
                                                            />
                                                            <Link
                                                                className='whitespace-nowrap truncate w-full'
                                                                href={
                                                                    '/zoom/recordings'
                                                                }
                                                            >
                                                                Recordings
                                                            </Link>
                                                        </div>
                                                    </SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>

                                {/* Staff Management  */}
                                <SidebarMenuItem>
                                    <Collapsible className='group/collapsible'>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={'Staff Management'}
                                            >
                                                <FolderOpen size={22} />
                                                <h2 className='whitespace-nowrap truncate'>
                                                    Staff Management
                                                </h2>
                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuButton
                                                        className={cn(
                                                            pathname.includes(
                                                                'staff-list',
                                                            )
                                                                ? 'bg-sidebar-primary text-pure-white'
                                                                : '',
                                                        )}
                                                        asChild
                                                    >
                                                        <div className='flex items-center gap-1'>
                                                            <FolderOpen
                                                                size={22}
                                                            />
                                                            <Link
                                                                className='whitespace-nowrap truncate w-full'
                                                                href={
                                                                    '/staff-management/staff-list'
                                                                }
                                                            >
                                                                Staff List
                                                            </Link>
                                                        </div>
                                                    </SidebarMenuButton>
                                                    <SidebarMenuButton
                                                        className={cn(
                                                            pathname.includes(
                                                                'role-management',
                                                            )
                                                                ? 'bg-sidebar-primary text-pure-white'
                                                                : '',
                                                        )}
                                                        asChild
                                                    >
                                                        <div className='flex items-center gap-1'>
                                                            <FolderOpen
                                                                size={22}
                                                            />
                                                            <Link
                                                                className='whitespace-nowrap truncate w-full'
                                                                href={
                                                                    '/staff-management/role-management'
                                                                }
                                                            >
                                                                Role Management
                                                            </Link>
                                                        </div>
                                                    </SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </SidebarContent>
            <SidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}

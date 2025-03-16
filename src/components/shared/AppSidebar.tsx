'use client';
import React from 'react';
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
import { ChevronRight, FolderOpen, GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '../ui/input';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../ui/collapsible';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

const AppSidebar = () => {
    const { theme } = useTheme();
    const pathname = usePathname();
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
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
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
};

export default AppSidebar;

'use client';

import { useRef, useState, useEffect } from 'react';
import {
    BookOpen,
    Calendar,
    ChevronRight,
    FileText,
    FolderOpen,
    GalleryVerticalEnd,
    HelpCircle,
    MessageSquare,
    Users,
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
    useSidebar,
} from '@/components/ui/sidebar';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
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

    const { activeCompany, companies, features } = useAppSelector(
        (state) => state.company,
    );
    const isCommunityAvailable = features?.find((f) => f.key === 'community');
    const isCalendarAvailable = features?.find((f) => f.key === 'calendar');
    const navigations = useAppSelector((state) => state.navigations);

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

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
    }, [filteredData]);

    const { theme } = useTheme();

    if (!isAuthenticated || !isMounted) {
        return <></>;
    }

    const programOpen =
        navigations.myProgram ||
        navigations.myE2eProgramAgenda ||
        navigations.myPurchasedItem ||
        navigations.myMedia ||
        navigations.showTell ||
        navigations.leaderboard ||
        navigations.technicalTest;

    const documentOpen =
        navigations.myDocument ||
        navigations.myUploadedDocument ||
        navigations.template;

    const interviewOpen =
        navigations.myMockInterview || navigations.reviewMockInterview;

    const resourcesOpen = navigations.myJobSupport || navigations.family;

    const supportOpen =
        navigations.myJobSupport ||
        navigations.family ||
        navigations.helpCenter ||
        navigations.myIssue;

    const { open } = useSidebar();

    return (
        <Sidebar collapsible='icon'>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size='lg'>
                            {!open && (
                                <div className='flex aspect-square size-8 items-center justify-center'>
                                    <Image
                                        src={
                                            theme === 'dark'
                                                ? '/logo-icon-white.png'
                                                : '/logo-icon.png'
                                        }
                                        width={30}
                                        height={30}
                                        alt='logo'
                                    />
                                </div>
                            )}
                            <Link href={`/dashboard`}>
                                <div className='flex flex-col gap-0.5 leading-none'>
                                    <Image
                                        src={
                                            theme === 'dark'
                                                ? '/logo.png'
                                                : '/logo-blue.png'
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
                            {/* Search input commented out */}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip={'Dashboard'}>
                                    <FolderOpen size={22} />
                                    <Link
                                        className='whitespace-nowrap truncate w-full'
                                        href={'/dashboard'}
                                    >
                                        Dashboard
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {programOpen && (
                                <SidebarMenuItem>
                                    <Collapsible className='group/collapsible w-full'>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={'Courses'}
                                            >
                                                <BookOpen size={20} />
                                                <h2 className='whitespace-nowrap truncate'>
                                                    Courses
                                                </h2>
                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {/* Bootcamps Submenu */}
                                                <SidebarMenuSubItem>
                                                    <Collapsible className='group/collapsible-sub w-full'>
                                                        <CollapsibleTrigger
                                                            asChild
                                                        >
                                                            <SidebarMenuButton>
                                                                <span>
                                                                    Bootcamps
                                                                </span>
                                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible-sub:rotate-90' />
                                                            </SidebarMenuButton>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <SidebarMenuSub>
                                                                {navigations?.myProgram && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/program'
                                                                            }
                                                                        >
                                                                            <Link href='/program'>
                                                                                Programs
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {navigations?.myE2eProgramAgenda && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/e2e-program-agenda'
                                                                            }
                                                                        >
                                                                            <Link href='/e2e-program-agenda'>
                                                                                E2E
                                                                                Program
                                                                                Agenda
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {navigations?.myMedia && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/audio-video'
                                                                            }
                                                                        >
                                                                            <Link href='/audio-video'>
                                                                                Audios/Videos
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {navigations?.showTell && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/show-and-tell'
                                                                            }
                                                                        >
                                                                            <Link href='/show-and-tell'>
                                                                                Show
                                                                                n
                                                                                Tell
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {navigations?.technicalTest && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/technical-tests'
                                                                            }
                                                                        >
                                                                            <Link href='/technical-tests'>
                                                                                Technical
                                                                                Tests
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {navigations?.myDayToDayActivity && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/day-to-day-activity'
                                                                            }
                                                                        >
                                                                            <Link href='/day-to-day-activity'>
                                                                                Day
                                                                                to
                                                                                day
                                                                                activities
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {navigations?.diagram && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/architecture-diagram'
                                                                            }
                                                                        >
                                                                            <Link href='/architecture-diagram'>
                                                                                Architecture
                                                                                Diagram
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}
                                                            </SidebarMenuSub>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                </SidebarMenuSubItem>

                                                {navigations.myPurchasedItem && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/program/online-courses'
                                                            }
                                                        >
                                                            <Link href='/program/online-courses'>
                                                                Online Courses
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>
                            )}

                            {documentOpen && (
                                <SidebarMenuItem>
                                    <Collapsible className='group/collapsible w-full'>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={'Documents'}
                                            >
                                                <FileText size={20} />
                                                <h2 className='whitespace-nowrap truncate'>
                                                    Documents
                                                </h2>
                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {navigations.myDocument && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/my-documents'
                                                            }
                                                        >
                                                            <Link href='/my-documents'>
                                                                My Documents
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}

                                                {navigations.myUploadedDocument && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/upload-documents'
                                                            }
                                                        >
                                                            <Link href='/upload-documents'>
                                                                Uploaded
                                                                Documents
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}

                                                {navigations.myProgram && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/documents-and-labs'
                                                            }
                                                        >
                                                            <Link href='/documents-and-labs'>
                                                                Documents & Labs
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}

                                                {navigations.myProgram && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/presentation-slides'
                                                            }
                                                        >
                                                            <Link href='/presentation-slides'>
                                                                Presentations/Slides
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}

                                                {navigations.template && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/my-templates'
                                                            }
                                                        >
                                                            <Link href='/my-templates'>
                                                                Templates
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>
                            )}

                            {/* Calendar */}
                            {navigations.myCalendar && isCalendarAvailable && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip={'Calendar'}
                                        isActive={pathname === '/calendar'}
                                    >
                                        <Calendar size={20} />
                                        <Link
                                            className='whitespace-nowrap truncate w-full'
                                            href='/calendar'
                                        >
                                            Calendar
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {interviewOpen && (
                                <SidebarMenuItem>
                                    <Collapsible className='group/collapsible w-full'>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={'Interviews'}
                                            >
                                                <Users size={20} />
                                                <h2 className='whitespace-nowrap truncate'>
                                                    Interviews
                                                </h2>
                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {navigations.myMockInterview && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/mock-interviews'
                                                            }
                                                        >
                                                            <Link href='/mock-interviews'>
                                                                Mock Interviews
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>
                            )}

                            {/* Community */}
                            {isCommunityAvailable && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip={'Community'}
                                        isActive={pathname === '/community'}
                                    >
                                        <MessageSquare size={20} />
                                        <Link
                                            className='whitespace-nowrap truncate w-full'
                                            href='/community'
                                        >
                                            Community
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {/* Supports */}
                            {supportOpen && (
                                <SidebarMenuItem>
                                    <Collapsible className='group/collapsible w-full'>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={'Supports'}
                                            >
                                                <HelpCircle size={20} />
                                                <h2 className='whitespace-nowrap truncate'>
                                                    Supports
                                                </h2>
                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {navigations.myIssue && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/my-issues'
                                                            }
                                                        >
                                                            <Link href='/my-issues'>
                                                                Bootcamps Hub
                                                                Issues
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}

                                                {navigations.family && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/my-family'
                                                            }
                                                        >
                                                            <Link href='/my-family'>
                                                                Families
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}

                                                {navigations.myJobSupport && (
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/my-job-support'
                                                            }
                                                        >
                                                            <Link href='/my-job-support'>
                                                                Job Supports
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}

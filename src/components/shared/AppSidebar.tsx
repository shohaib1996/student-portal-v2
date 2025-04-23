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
    ListChecks,
    MessageSquare,
    MessageSquareMore,
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
import { Button } from '../ui/button';
import { toast } from 'sonner';

export type TLoookup = {
    data: any;
    id: string;
    parent: number | string;
    text?: string;
    children: TLoookup[];
};

export function AppSidebar() {
    const { chats = [] } = useAppSelector((state) => state.chat);
    const { user, isAuthenticated, enrollment } = useAppSelector(
        (state) => state.auth,
    );
    const [wordEntered, setWordEntered] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);
    // const { chats } = useSelector((state: RootState) => state.chat);
    const [unread, setUnread] = useState<any[]>([]);

    useEffect(() => {
        const channels =
            chats?.filter(
                (x: any) => x?.isChannel && (x?.unreadCount ?? 0) > 0,
            ) || [];
        setUnread(channels); // Add this line to store the result in state
    }, [chats]);

    const { activeCompany, companies, features } = useAppSelector(
        (state) => state.company,
    );
    const isChatAvailable = features?.find((f) => f.key === 'chat');
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
    if (!isAuthenticated || !isMounted) {
        return <></>;
    }

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
                                                ? enrollment?.branch?.data
                                                      ?.branchLogo ||
                                                  enrollment?.organization?.data
                                                      ?.companyLogo ||
                                                  '/logo-icon-white.png'
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
                            {/* <SidebarMenuItem className='border rounded-sm'>
                                <SidebarMenuButton
                                    className='p-0 m-0 rounded-sm'
                                    tooltip='select your company'
                                >
                                    <UniversitySectionOpenButton />
                                </SidebarMenuButton>
                            </SidebarMenuItem> */}
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
                                                    My Courses
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
                                                                    Bootcamp
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
                                                                                Program
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {navigations?.myProgram && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/payment-history'
                                                                            }
                                                                        >
                                                                            <Link href='/payment-history'>
                                                                                Payments
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )}

                                                                {/* {navigations?.myE2eProgramAgenda && (
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
                                                                )} */}

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

                                                                {/* {navigations?.showTell && (
                                                                    <SidebarMenuSubItem>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                '/show-n-tell'
                                                                            }
                                                                        >
                                                                            <Link href='/show-n-tell'>
                                                                                Show
                                                                                n
                                                                                Tell
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuSubItem>
                                                                )} */}

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

                                                                {/* {navigations?.myDayToDayActivity && (
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
                                                                )} */}

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
                                                                '/program/my-enrollments'
                                                            }
                                                        >
                                                            <Link href='/program/my-enrollments'>
                                                                My Enrollments
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
                            {navigations.myCalendar && (
                                <SidebarMenuItem>
                                    <Collapsible className='group/collapsible w-full'>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={'Calendar'}
                                                isActive={
                                                    pathname === '/calendar'
                                                }
                                            >
                                                <Calendar size={20} />
                                                <Link
                                                    className='whitespace-nowrap truncate w-full'
                                                    href='/calendar'
                                                >
                                                    Calendar
                                                </Link>
                                                <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={
                                                            pathname ===
                                                            '/calendar/events'
                                                        }
                                                    >
                                                        <Link href='/calendar/events'>
                                                            Events
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={
                                                            pathname ===
                                                            '/calendar/to-do'
                                                        }
                                                    >
                                                        <Link href='/calendar/to-do'>
                                                            To-Do
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
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
                                                    <SidebarMenuSubItem
                                                        onClick={() =>
                                                            toast.info(
                                                                'Comming soon',
                                                            )
                                                        }
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                pathname ===
                                                                '/mock-interviews'
                                                            }
                                                        >
                                                            {/* <Link href='/mock-interviews'>
                                                            </Link> */}
                                                            Mock Interviews
                                                        </SidebarMenuButton>
                                                    </SidebarMenuSubItem>
                                                )}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>
                            )}

                            {/* Chat */}
                            {/* {isChatAvailable && ( */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip={'Chat'}
                                    isActive={pathname === '/chat'}
                                >
                                    <div
                                        className={`cursor-pointer flex items-center justify-center rounded-md duration-200 `}
                                    >
                                        <div className='relative'>
                                            <MessageSquareMore className='h-5 w-5 text-dark-gray' />
                                            {unread.length > 0 && (
                                                <>
                                                    <span className='absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500'></span>
                                                    <span className='absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping'></span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        className='whitespace-nowrap truncate w-full'
                                        href='/chat'
                                    >
                                        Chat
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {/* )} */}
                            {/* Community */}
                            {/* {isCommunityAvailable && ( */}
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
                            {/* )} */}

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip={'My Notes'}
                                    isActive={pathname === '/my-notes'}
                                >
                                    <ListChecks size={20} />
                                    <Link
                                        className='whitespace-nowrap truncate w-full'
                                        href='/my-notes'
                                    >
                                        My Notes
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Supports */}
                            {/* {supportOpen && (
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
                            )} */}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Highlighter from 'react-highlight-words';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    BookOpen,
    Briefcase,
    CalendarDays,
    Clock,
    ExternalLink,
    Mail,
    MapPin,
    MessageSquare,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '../ui/separator';

// Dynamic import of markdown preview component
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
    ssr: false,
});

interface MessagePreviewProps {
    text: string;
    searchQuery?: string;
    isUser?: boolean;
}

// Dummy user data fetch function
const fetchUserInfo = async (userId: string) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: userId,
                name: 'John Doe',
                role: 'Senior Software Engineer',
                program: 'Full Stack Development',
                session: 'Spring 2025',
                avatar: `https://i.pravatar.cc/150?u=${userId}`,
                department: 'Engineering',
                location: 'San Francisco, CA',
                email: 'john.doe@example.com',
                joinDate: 'January 2023',
                status: 'online',
                bio: 'Full-stack developer with 5+ years of experience in React and Node.js',
                skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
            });
        }, 300);
    });
};

// Popover component for mentions
const MentionPopover = ({
    userId,
    userName,
}: {
    userId: string;
    userName: string;
}) => {
    const [user, setUser] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        fetchUserInfo(userId).then(setUser);
    }, [userId]);

    useEffect(() => {
        const handleScroll = () => {
            if (open) {
                setOpen(false);
            }
        };
        document.addEventListener('scroll', handleScroll, true); // use capture phase
        return () => {
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <span
                    ref={triggerRef}
                    className='mention text-yellow-500 hover:underline cursor-pointer'
                >
                    @{userName}
                </span>
            </PopoverTrigger>
            <PopoverContent
                className='w-fit max-w-[300px] p-2 bg-background'
                align='start'
            >
                {user ? (
                    <div className='flex flex-col'>
                        {/* Header with background */}
                        <div className='bg-gradient-to-r from-primary/10 to-primary/5 p-2 relative'>
                            <div className='flex items-start gap-2'>
                                <div className='relative'>
                                    <Avatar className='h-16 w-16 border-2 border-primary shadow-sm'>
                                        <AvatarImage
                                            src={user.avatar || '/avatar.png'}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className='text-lg'>
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500`}
                                    />
                                </div>
                                <div className='flex-1 space-y-1'>
                                    <div className='flex items-center justify-between'>
                                        <h3 className='font-semibold text-lg leading-tight'>
                                            {user.name}
                                        </h3>
                                        {/* <Badge
                                            variant='outline'
                                            className={`${user.status === 'online' ? 'bg-green-500/10 text-green-600' : user.status === 'away' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {user.status === 'online'
                                                ? 'Online'
                                                : user.status === 'away'
                                                  ? 'Away'
                                                  : 'Offline'}
                                        </Badge> */}
                                    </div>
                                    <p className='text-sm font-medium text-gray '>
                                        {user.role}
                                    </p>
                                    <p className='text-xs text-gray flex items-center gap-1'>
                                        <Briefcase className='h-3 w-3' />
                                        {user.department}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User details */}
                        <div className='p-2 space-y-2'>
                            <div className='grid grid-cols-1 gap-2 text-sm'>
                                <div className='flex items-center gap-2 text-gray '>
                                    <MapPin className='h-3.5 w-3.5' />
                                    <span className='max-w-[250px] truncate'>
                                        {user.location}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray '>
                                    <Mail className='h-3.5 w-3.5' />
                                    <span className='max-w-[250px] truncate'>
                                        {user.email}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray '>
                                    <BookOpen className='h-3.5 w-3.5' />
                                    <span className='max-w-[250px] truncate'>
                                        {user.program}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray '>
                                    <CalendarDays className='h-3.5 w-3.5' />
                                    <span className='max-w-[250px] truncate'>
                                        {user.session}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray '>
                                    <Clock className='h-3.5 w-3.5' />
                                    <span className='max-w-[250px] truncate'>
                                        Joined {user.joinDate}
                                    </span>
                                </div>
                            </div>

                            {user.bio && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className='text-xs font-medium text-dark-gray mb-1'>
                                            BIO
                                        </h4>
                                        <p className='text-sm line-clamp-2 text-gray'>
                                            {user.bio}
                                        </p>
                                    </div>
                                </>
                            )}

                            {user.skills && user.skills.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className='text-xs font-medium text-dark-gray mb-2'>
                                            SKILLS
                                        </h4>
                                        <div className='flex flex-wrap gap-1.5 text-gray'>
                                            {user.skills.map(
                                                (skill: string) => (
                                                    <Badge
                                                        key={skill}
                                                        variant='secondary'
                                                        className='text-xs bg-foreground'
                                                    >
                                                        {skill}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer with actions */}
                        <div className='flex items-center justify-between'>
                            <Button
                                size='sm'
                                className='h-8 text-xs p-1 !text-pure-white'
                            >
                                <MessageSquare className='h-3.5 w-3.5' />
                                Message
                            </Button>
                            <Button
                                size='sm'
                                className='h-8 text-xs p-1 !text-pure-white'
                            >
                                <ExternalLink className='h-3.5 w-3.5' />
                                View Profile
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className='p-4 flex items-center justify-center h-20'>
                        <div className='animate-pulse flex space-x-4'>
                            <div className='rounded-full bg-muted h-10 w-10'></div>
                            <div className='flex-1 space-y-2 py-1'>
                                <div className='h-2 bg-muted rounded w-3/4'></div>
                                <div className='h-2 bg-muted rounded w-1/2'></div>
                            </div>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

// Transforms @mention markdown to custom markdown-style links
function transformMessage(text?: string): string {
    if (!text) {
        return '';
    }
    return text.replace(
        /@\[(.*?)\]\((.*?)\)/g,
        (_, name, id) => `[**@${name}**](mention:${id})`,
    );
}

// Transforms {{DATE:...}} into readable text with timezone
const transformDate = (text?: string): string => {
    if (!text) {
        return '';
    }
    const regexPattern = /\{\{DATE:(.*?)\}\}/g;
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return text.replace(regexPattern, (_, startTime) => {
        return `${dayjs(startTime).format('MMMM D YYYY, h:mm A')} (${userTimezone})`;
    });
};

// Custom renderer for markdown <a> tags
const components = {
    a: ({
        node,
        href,
        children,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { node?: any }) => {
        const isMention = href?.startsWith('mention:');
        if (isMention && href) {
            const userId = href.replace('mention:', '');

            // Extract text content of children (flatten and join strings)
            const userName = React.Children.toArray(children)
                .map((child: any) => {
                    if (typeof child === 'string') {
                        return child;
                    }
                    if (
                        child?.props?.children &&
                        typeof child.props.children === 'string'
                    ) {
                        return child.props.children;
                    }
                    return '';
                })
                .join('')
                .replace('**@', '')
                .replace('@', '')
                .replace('**', '')
                .trim();

            return (
                <MentionPopover
                    userId={userId}
                    userName={userName || 'Unknown'}
                />
            );
        }

        return (
            <a target='_blank' rel='noopener noreferrer' href={href} {...props}>
                {children}
            </a>
        );
    },
};

function MessagePreview({ text, searchQuery, isUser }: MessagePreviewProps) {
    const { theme } = useTheme();

    // 1. Transform mentions and dates
    const processedText = transformDate(transformMessage(text));

    return (
        <div className='message-preview'>
            <MarkdownPreview
                source={processedText}
                components={components}
                wrapperElement={{
                    'data-color-mode': theme === 'dark' ? 'dark' : 'light',
                }}
                className={`${
                    isUser
                        ? '!text-pure-white/80 dark:!text-pure-white/80'
                        : '!text-gray dark:!text-pure-white/90'
                }`}
            />

            {searchQuery && (
                <div className='hidden'>
                    <Highlighter
                        highlightClassName='bg-yellow-200 text-black rounded-sm px-0.5'
                        searchWords={[searchQuery]}
                        autoEscape={true}
                        textToHighlight={processedText}
                    />
                </div>
            )}
        </div>
    );
}

export default MessagePreview;

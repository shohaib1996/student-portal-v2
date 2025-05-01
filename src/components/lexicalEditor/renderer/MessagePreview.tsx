'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Highlighter from 'react-highlight-words';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import MentionedUserPopover from './MentionedUserPopover';
import { useGetMentionedUserDetailsQuery } from '@/redux/api/chats/chatApi';

// Dynamic import of markdown preview component
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
    ssr: false,
});

interface MessagePreviewProps {
    text: string;
    searchQuery?: string;
    isUser?: boolean;
    hasCode?: any;
}

// Popover component for mentions
const MentionPopover = ({
    userId,
    userName,
}: {
    userId: string;
    userName: string;
}) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLSpanElement>(null);

    // Use RTK Query to fetch user details
    const { data: userData, isLoading } = useGetMentionedUserDetailsQuery(
        userId,
        {
            skip: !open, // Only fetch when popover is open
        },
    );

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
                    className='mention text-primary bg-blue-200 dark:bg-blue-300 text-xs rounded-full px-1 hover:underline cursor-pointer'
                >
                    @{userName}
                </span>
            </PopoverTrigger>
            {userId !== 'everyone' && (
                <MentionedUserPopover
                    userId={userId}
                    userData={userData}
                    isLoading={isLoading}
                    userName={userName}
                />
            )}
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

function MessagePreview({
    text,
    searchQuery,
    isUser,
    hasCode,
}: MessagePreviewProps) {
    const { theme } = useTheme();

    // 1. Transform mentions and dates
    const processedText = transformDate(transformMessage(text));
    return (
        <div className='message-preview'>
            {hasCode === true ? (
                <MarkdownPreview
                    source={processedText}
                    components={components}
                    wrapperElement={{
                        'data-color-mode': isUser
                            ? 'dark'
                            : theme === 'dark'
                              ? 'dark'
                              : 'light',
                    }}
                    className='!text-gray dark:!text-pure-white/90'
                />
            ) : (
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
            )}

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

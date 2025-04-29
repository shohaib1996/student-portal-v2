'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Highlighter from 'react-highlight-words';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import MentionedUserPopover from './MentionedUserPopover';
import { useGetMentionedUserDetailsQuery } from '@/redux/api/chats/chatApi';
import CustomMarkdownPreview from './CustomMarkdownPreview/CustomMarkdownPreview';

// Dynamic import for code-only markdown preview
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
    ssr: false,
});

interface MessageRendererProps {
    text: string;
    searchQuery?: string;
    isUser?: boolean;
    hasCode?: boolean;
    isThread?: boolean;
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

// Set up a custom renderer for the mentions in the CustomMarkdownRenderer
const setupMentionHandlers = () => {
    useEffect(() => {
        // Handler for click events on mention tags
        const handleMentionClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('mention-tag')) {
                const userId = target.getAttribute('data-userid');
                const userName = target.getAttribute('data-username');

                // Here we would trigger the popover to open
                // For simplicity, we're just logging the data
                console.log('Mention clicked:', userId, userName);

                // You could implement a global state or context to handle showing the popover
            }
        };

        document.addEventListener('click', handleMentionClick);

        return () => {
            document.removeEventListener('click', handleMentionClick);
        };
    }, []);
};

function MessageRenderer({
    text,
    searchQuery,
    isUser,
    hasCode,
    isThread,
}: MessageRendererProps) {
    const { theme } = useTheme();
    setupMentionHandlers();

    // Check if the content contains code blocks
    const containsCodeBlocks = /```[\s\S]*?```/g.test(text);

    // Transform @mentions in text for the MarkdownPreview component
    const transformMessage = (input: string): string => {
        if (!input) {
            return '';
        }
        return input.replace(
            /@\[(.*?)\]\((.*?)\)/g,
            (_, name, id) => `[**@${name}**](mention:${id})`,
        );
    };

    // Transforms {{DATE:...}} into readable text with timezone
    const transformDate = (input: string): string => {
        if (!input) {
            return '';
        }
        const regexPattern = /\{\{DATE:(.*?)\}\}/g;
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return input.replace(regexPattern, (_, startTime) => {
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
                <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href={href}
                    {...props}
                >
                    {children}
                </a>
            );
        },
    };

    // Process the text for code blocks
    const processedTextForCode =
        containsCodeBlocks || hasCode === true
            ? transformDate(transformMessage(text))
            : text;

    return (
        <div className='message-preview'>
            {containsCodeBlocks || hasCode === true ? (
                // For code blocks, we'll use the original MarkdownPreview for syntax highlighting
                <MarkdownPreview
                    source={processedTextForCode}
                    components={components}
                    // wrapperElement={{
                    //     'data-color-mode': isUser
                    //         ? 'dark'
                    //         : theme === 'dark'
                    //           ? 'dark'
                    //           : 'light',
                    // }}
                    // className={`${
                    //     isUser
                    //         ? '!text-pure-white/80 dark:!text-pure-white/80'
                    //         : '!text-gray dark:!text-pure-white/90'
                    // }`}
                    wrapperElement={{
                        'data-color-mode': theme === 'dark' ? 'dark' : 'light',
                    }}
                    className={`!text-gray dark:!text-pure-white/90`}
                />
            ) : (
                // For regular text, use our custom renderer
                <CustomMarkdownPreview
                    text={text}
                    isUser={isUser}
                    isThread={isThread}
                />
            )}

            {searchQuery && (
                <div className='hidden'>
                    <Highlighter
                        highlightClassName='bg-yellow-200 text-black rounded-sm px-0.5'
                        searchWords={[searchQuery]}
                        autoEscape={true}
                        textToHighlight={text}
                    />
                </div>
            )}
        </div>
    );
}

export default MessageRenderer;

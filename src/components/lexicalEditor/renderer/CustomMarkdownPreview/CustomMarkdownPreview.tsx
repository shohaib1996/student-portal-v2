'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import MentionedUserPopover from '../MentionedUserPopover';
import { useGetMentionedUserDetailsQuery } from '@/redux/api/chats/chatApi';

interface CustomMarkdownRendererProps {
    text: string;
    isUser?: boolean;
}

// MentionTag component that integrates the popover
const MentionTag = ({
    userId,
    userName,
}: {
    userId: string;
    userName: string;
}) => {
    const [open, setOpen] = React.useState(false);
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
                    className='mention-tag text-blue-700 bg-blue-200 hover:bg-blue-200 dark:bg-blue-300 dark:hover:bg-blue-300 text-xs rounded-full px-1 hover:underline cursor-pointer'
                    data-userid={userId}
                    data-username={userName}
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

// Transform @mention pattern to the format we handle
const transformMentions = (text?: string): React.ReactNode[] => {
    if (!text) {
        return [];
    }

    // Split the text by the @[name](id) pattern
    const parts = [];
    let lastIndex = 0;
    const regex = /@\[(.*?)\]\((.*?)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            // Add text before the match
            parts.push(text.substring(lastIndex, match.index));
        }

        // Add the mention component
        const [fullMatch, name, id] = match;
        parts.push(
            <MentionTag
                key={`mention-${id}-${match.index}`}
                userId={id}
                userName={name}
            />,
        );

        lastIndex = match.index + fullMatch.length;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts;
};

// Transform dates
const transformDates = (text?: string): string => {
    if (!text) {
        return '';
    }
    const regexPattern = /\{\{DATE:(.*?)\}\}/g;
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return text.replace(regexPattern, (_, startTime) => {
        return `${new Date(startTime).toLocaleString()} (${userTimezone})`;
    });
};

// Pre-process text to handle markdown and HTML correctly
const preprocessText = (text?: string): string => {
    if (!text) {
        return '';
    }

    let processed = text;

    // First process text for dates
    processed = transformDates(processed);

    // Convert the text to handle the line breaks first
    // Replace single newlines with <br> tags (only when not inside a list item)
    const lines = processed.split('\n');
    const processedLines = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this line starts a list item
        if (line.match(/^\d+\.\s/) || line.match(/^\*\s/)) {
            inList = true;
            processedLines.push(line);
        }
        // Check if this line is empty (which might end a list)
        else if (line.trim() === '') {
            inList = false;
            processedLines.push(line);
        }
        // Normal line
        else {
            if (!inList && i > 0 && lines[i - 1].trim() !== '') {
                // Add <br> before the line if it's not in a list and the previous line wasn't empty
                processedLines.push(line);
            } else {
                processedLines.push(line);
            }
        }
    }

    processed = processedLines.join('\n');

    // Handle ordered lists
    processed = processed.replace(
        /^(\d+)\.\s(.*)$/gm,
        '<li value="$1">$2</li>',
    );
    processed = processed.replace(/(<li[^>]*>.*<\/li>\s*)+/g, '<ol>$&</ol>');

    // Handle unordered lists
    processed = processed.replace(/^\*\s(.*)$/gm, '<li>$1</li>');
    processed = processed.replace(/(<li>.*<\/li>\s*)+/g, (match) => {
        // Only wrap in <ul> if not already inside an <ol>
        if (!match.includes('<li value=')) {
            return '<ul>' + match + '</ul>';
        }
        return match;
    });

    // Replace ** for strong/bold with <strong> tags
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace * for emphasis/italic with <em> tags
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Replace single newlines with <br> tags (only when not followed by another newline)
    // But avoid adding <br> after list items
    processed = processed.replace(/(?<!\n)(?<!<\/li>)\n(?!\n)/g, '<br />');

    // Replace double newlines with paragraph breaks
    processed = processed.replace(/\n\n+/g, '</p><p>');

    // Wrap content in paragraphs
    processed = '<p>' + processed + '</p>';

    // Clean up empty paragraphs
    processed = processed.replace(/<p>\s*<\/p>/g, '');

    return processed;
};

const CustomMarkdownPreview = ({
    text,
    isUser = false,
}: CustomMarkdownRendererProps) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark' || isUser;

    // First handle mentions which need to be React components
    const textParts = [];

    // Check for mentions in the text
    const hasMentions = /@\[(.*?)\]\((.*?)\)/g.test(text);

    if (hasMentions) {
        // If there are mentions, we need to split the text and process each part
        const splitByMention = text.split(/(@\[.*?\]\(.*?\))/g);

        splitByMention.forEach((part, index) => {
            if (part.match(/^@\[(.*?)\]\((.*?)\)$/)) {
                // This is a mention
                const mentionMatch = part.match(/^@\[(.*?)\]\((.*?)\)$/);
                if (mentionMatch) {
                    const [_, name, id] = mentionMatch;
                    textParts.push(
                        <MentionTag
                            key={`mention-${id}-${index}`}
                            userId={id}
                            userName={name}
                        />,
                    );
                }
            } else if (part.trim()) {
                // This is regular text - process it normally
                const processedPart = preprocessText(transformDates(part));
                textParts.push(
                    <span
                        key={`text-${index}`}
                        dangerouslySetInnerHTML={{ __html: processedPart }}
                    />,
                );
            }
        });
    } else {
        // No mentions, process text normally
        const processedText = preprocessText(transformDates(text));
        textParts.push(
            <span
                key='text-content'
                dangerouslySetInnerHTML={{ __html: processedText }}
            />,
        );
    }

    return (
        <>
            <div
                className={`custom-text ${isDarkMode ? 'dark' : 'light'} ${
                    isUser ? 'text-pure-white/80' : 'text-dark-gray'
                }`}
            >
                {textParts}
            </div>

            <style jsx global>{`
                .custom-text.dark {
                    color: #ffffff;
                }
                .custom-text.light {
                    color: #374151;
                }
                .custom-text.text-pure-white {
                    color: #ffffff;
                }
                .custom-text.text-dark-gray {
                    color: #374151;
                }
                /* List styling */
                .custom-text ol {
                    list-style-type: decimal;
                    padding-left: 2rem;
                    margin-bottom: 1rem;
                }
                .custom-text ul {
                    list-style-type: disc;
                    padding-left: 2rem;
                    margin-bottom: 1rem;
                }
                .custom-text li {
                    padding-left: 0.25rem;
                    margin-bottom: 0.25rem;
                }
                /* Text formatting */
                .custom-text strong {
                    font-weight: 700;
                }
                .custom-text em {
                    font-style: italic;
                }
                /* Links */
                .custom-text a:not(.mention) {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .custom-text.dark a:not(.mention) {
                    color: #60a5fa;
                }
                /* Ensure mentions display correctly */
                .mention-tag,
                .mention {
                    display: inline-block;
                }
                /* Ensure paragraphs have proper spacing */
                .custom-text p {
                    margin-bottom: 1rem;
                }
                .custom-text p:last-child {
                    margin-bottom: 0;
                }
                .mention-tag,
                .mention {
                    display: inline-block;
                    cursor: pointer;
                    border-radius: 9999px; /* rounded-full */

                    padding: 0px 4px;
                    transition: background-color 0.2s ease;
                }
            `}</style>
        </>
    );
};

export default CustomMarkdownPreview;

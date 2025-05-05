'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import MentionedUserPopover from '../MentionedUserPopover';
import { useGetMentionedUserDetailsQuery } from '@/redux/api/chats/chatApi';

interface CustomMarkdownRendererProps {
    text: string;
    isUser?: boolean;
    isThread?: boolean;
}

// MentionTag component that integrates the popover
const MentionTag = ({
    userId,
    userName,
    noWrap = false,
}: {
    userId: string;
    userName: string;
    noWrap?: boolean;
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
                    style={{
                        display: 'inline',
                        whiteSpace: noWrap ? 'nowrap' : 'normal',
                        verticalAlign: 'baseline',
                    }}
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

    // FIRST remove backslash escaping
    processed = processed.replace(/\\([_*])/g, '$1');

    // THEN convert URLs to anchor tags with a more comprehensive regex that handles special characters
    // eslint-disable-next-line no-useless-escape
    const urlRegex = /(\b(https?:\/\/|www\.)[^\s<>\[\]{}()"'\\]+)/gi;
    processed = processed.replace(urlRegex, (url) => {
        const href = url.startsWith('www.') ? 'https://' + url : url;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Process headings (# for h1, ## for h2, etc.) - add this BEFORE line processing
    // Handle headings up to h6
    processed = processed.replace(/^######\s+(.*?)$/gm, '<h6>$1</h6>');
    processed = processed.replace(/^#####\s+(.*?)$/gm, '<h5>$1</h5>');
    processed = processed.replace(/^####\s+(.*?)$/gm, '<h4>$1</h4>');
    processed = processed.replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>');
    processed = processed.replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>');
    processed = processed.replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>');
    // Convert the text to handle the line breaks first
    const lines = processed.split('\n');
    const processedLines = [];
    let inList = false;
    let listType = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Check if this line starts a list item (now including hyphens)
        if (
            trimmedLine.match(/^\d+\.\s/) ||
            trimmedLine.match(/^\*\s/) ||
            trimmedLine.match(/^-\s/) ||
            trimmedLine.match(/^\[\s?\]\s/) ||
            trimmedLine.match(/^\[x\]\s/)
        ) {
            // Determine list type
            if (trimmedLine.match(/^\d+\.\s/)) {
                listType = 'ol';
            } else if (
                trimmedLine.match(/^\[\s?\]\s/) ||
                trimmedLine.match(/^\[x\]\s/)
            ) {
                listType = 'checklist';
            } else {
                listType = 'ul';
            }

            inList = true;
            processedLines.push(line);
        }
        // Check if this line is empty (which might end a list)
        else if (trimmedLine === '') {
            inList = false;
            listType = '';
            processedLines.push(line);
        }
        // Check if line is a heading (in which case we don't want to add <br>)
        else if (line.match(/^<h[1-6]>/)) {
            processedLines.push(line);
        }
        // Normal line
        else {
            if (
                !inList &&
                i > 0 &&
                lines[i - 1].trim() !== '' &&
                !lines[i - 1].match(/^<h[1-6]>/)
            ) {
                // Add <br> before the line if it's not in a list, not a heading, and the previous line wasn't empty
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

    // Handle unordered lists with both * and - (hyphen)
    processed = processed.replace(/^\*\s(.*)$/gm, '<li>$1</li>');
    processed = processed.replace(/^-\s(.*)$/gm, '<li>$1</li>'); // Add support for hyphen-based lists

    // Handle checkboxes
    processed = processed.replace(
        /^\[\s?\]\s(.*)$/gm,
        '<li class="checkbox unchecked">$1</li>',
    );
    processed = processed.replace(
        /^\[x\]\s(.*)$/gm,
        '<li class="checkbox checked">$1</li>',
    );

    // Group list items
    let inOrderedList = false;
    let inUnorderedList = false;
    let inCheckList = false;

    const wrappedLines = [];
    const allLines = processed.split('\n');

    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];

        // Check if line is a list item
        if (line.match(/<li value="\d+">/)) {
            // Start ordered list if not already in one
            if (!inOrderedList) {
                if (inUnorderedList) {
                    wrappedLines.push('</ul>');
                    inUnorderedList = false;
                }
                if (inCheckList) {
                    wrappedLines.push('</ul>');
                    inCheckList = false;
                }
                wrappedLines.push('<ol>');
                inOrderedList = true;
            }
            wrappedLines.push(line);
        } else if (line.match(/<li class="checkbox/)) {
            // Start checklist if not already in one
            if (!inCheckList) {
                if (inOrderedList) {
                    wrappedLines.push('</ol>');
                    inOrderedList = false;
                }
                if (inUnorderedList) {
                    wrappedLines.push('</ul>');
                    inUnorderedList = false;
                }
                wrappedLines.push('<ul class="checklist">');
                inCheckList = true;
            }
            wrappedLines.push(line);
        } else if (line.match(/<li>/)) {
            // Start unordered list if not already in one
            if (!inUnorderedList) {
                if (inOrderedList) {
                    wrappedLines.push('</ol>');
                    inOrderedList = false;
                }
                if (inCheckList) {
                    wrappedLines.push('</ul>');
                    inCheckList = false;
                }
                wrappedLines.push('<ul>');
                inUnorderedList = true;
            }
            wrappedLines.push(line);
        } else {
            // Close any open lists
            if (inOrderedList) {
                wrappedLines.push('</ol>');
                inOrderedList = false;
            }
            if (inUnorderedList) {
                wrappedLines.push('</ul>');
                inUnorderedList = false;
            }
            if (inCheckList) {
                wrappedLines.push('</ul>');
                inCheckList = false;
            }
            wrappedLines.push(line);
        }
    }

    // Close any remaining open lists
    if (inOrderedList) {
        wrappedLines.push('</ol>');
    }
    if (inUnorderedList) {
        wrappedLines.push('</ul>');
    }
    if (inCheckList) {
        wrappedLines.push('</ul>');
    }

    processed = wrappedLines.join('\n');

    // Replace ** for strong/bold with <strong> tags
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace * for emphasis/italic with <em> tags
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Handle code blocks
    processed = processed.replace(
        /```([\s\S]*?)```/g,
        '<pre><code>$1</code></pre>',
    );

    // Handle inline code
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Handle blockquotes
    processed = processed.replace(/^>\s(.*)$/gm, '<blockquote>$1</blockquote>');

    // Group consecutive blockquotes
    processed = processed.replace(/(<\/blockquote>\s*<blockquote>)/g, '<br />');

    // Replace single newlines with <br> tags (only when not followed by another newline)
    // But avoid adding <br> after list items, headers, etc.
    processed = processed.replace(
        /(?<!\n)(?<!<\/li>)(?<!<\/h[1-6]>)(?<!<\/blockquote>)(?<!<\/pre>)\n(?!\n)(?!<(ol|ul|li|h[1-6]|blockquote|pre))/g,
        '<br />',
    );
    // Add this line after the emphasis/italic formatting (right after processing the * for italic)
    processed = processed.replace(/~~(.*?)~~/g, '<del>$1</del>');
    // Replace double newlines with paragraph breaks
    processed = processed.replace(/\n\n+/g, '</p><p>');
    // Wrap content in paragraphs
    processed = '<p>' + processed + '</p>';

    // Clean up nested paragraph tags and empty paragraphs
    processed = processed.replace(/<p><p>/g, '<p>');
    processed = processed.replace(/<\/p><\/p>/g, '</p>');
    processed = processed.replace(/<p>\s*<\/p>/g, '');

    // Fix potential issue where elements might get wrapped in paragraphs incorrectly
    processed = processed.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
    processed = processed.replace(/<p>(<pre>[\s\S]*?<\/pre>)<\/p>/g, '$1');
    processed = processed.replace(
        /<p>(<blockquote>.*?<\/blockquote>)<\/p>/g,
        '$1',
    );
    processed = processed.replace(/<p>(<ol>[\s\S]*?<\/ol>)<\/p>/g, '$1');
    processed = processed.replace(
        /<p>(<ul[\s\S]*?>[\s\S]*?<\/ul>)<\/p>/g,
        '$1',
    );

    return processed;
};

// Extended version with line-by-line mentions handling
const CustomMarkdownPreview = ({
    text,
    isUser = false,
    isThread = false,
}: CustomMarkdownRendererProps) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark' || isUser;

    // This is our hybrid approach: Line-by-line mention processing with full HTML for everything else
    const renderContent = () => {
        if (!text) {
            return null;
        }

        // Extract all mentions for later reinsertion
        const mentions: Array<{
            match: string;
            name: string;
            id: string;
            index: number;
        }> = [];

        // Find all mentions in the text
        const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;
        let match;
        const tempText = text;

        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push({
                match: match[0],
                name: match[1],
                id: match[2],
                index: match.index,
            });
        }

        // Replace all mentions with markers
        let processableText = text;
        const markers: Array<{ marker: string; id: string; name: string }> = [];

        mentions.forEach((mention, idx) => {
            const marker = `__MENTION_MARKER_${idx}__`;
            markers.push({
                marker,
                id: mention.id,
                name: mention.name,
            });

            processableText = processableText.replace(mention.match, marker);
        });

        // Process the text with standard Markdown
        const processedHtml = preprocessText(processableText);

        // Replace mention markers with actual MentionTag components
        let currentHtml = processedHtml;
        const parts: React.ReactNode[] = [];

        markers.forEach(({ marker, id, name }) => {
            const [before, ...rest] = currentHtml.split(marker);
            const after = rest.join(marker); // In case the marker text appears in content

            if (before) {
                parts.push(
                    <span
                        key={`html-${parts.length}`}
                        dangerouslySetInnerHTML={{ __html: before }}
                    />,
                );
            }

            parts.push(
                <MentionTag
                    key={`mention-${id}-${parts.length}`}
                    userId={id}
                    userName={name}
                    noWrap={true}
                />,
            );

            currentHtml = after;
        });

        // Add any remaining HTML
        if (currentHtml) {
            parts.push(
                <span
                    key={`html-final`}
                    dangerouslySetInnerHTML={{ __html: currentHtml }}
                />,
            );
        }

        return parts;
    };

    return (
        <>
            <div
                className={`custom-text-wrapper ${isDarkMode ? 'dark' : 'light'} ${
                    isUser && !isThread
                        ? 'text-pure-white/90'
                        : !isThread && 'text-dark-gray'
                }`}
            >
                <div className='custom-text'>{renderContent()}</div>
            </div>
            <GlobalStyles />
        </>
    );
};

// Extract global styles to a separate component for cleaner code
const GlobalStyles = () => (
    <style jsx global>{`
        /* Wrapper styles */
        .custom-text-wrapper {
            width: 100%;
        }

        /* List styling */
        .custom-text ol {
            list-style-type: decimal;
            padding-left: 2rem;
            margin-bottom: 1rem;
        }
        .custom-text::selection {
            background: #a1c4ff;
            color: #3c0ce9;
        }
        .custom-text ul {
            list-style-type: disc;
            padding-left: 2rem;
            margin-bottom: 1rem;
        }
        .custom-text ul.checklist {
            list-style-type: none;
            padding-left: 2rem;
            margin-bottom: 1rem;
        }
        .custom-text li {
            padding-left: 0.25rem;
            margin-bottom: 0.25rem;
        }
        .custom-text li.checkbox {
            position: relative;
            padding-left: 1.5rem;
            list-style-type: none;
        }
        .custom-text li.checkbox::before {
            content: '☐';
            position: absolute;
            left: 0;
            font-size: 1.2em;
        }
        .custom-text li.checkbox.checked::before {
            content: '☑';
        }

        /* Heading styling */
        .custom-text h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        .custom-text h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
            line-height: 1.3;
        }
        .custom-text h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.75rem;
            line-height: 1.4;
        }
        .custom-text h4 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-top: 0.75rem;
            margin-bottom: 0.5rem;
        }
        .custom-text h5 {
            font-size: 1rem;
            font-weight: 600;
            margin-top: 0.75rem;
            margin-bottom: 0.5rem;
        }
        .custom-text h6 {
            font-size: 0.875rem;
            font-weight: 600;
            margin-top: 0.75rem;
            margin-bottom: 0.5rem;
        }

        /* Text formatting */
        .custom-text strong {
            font-weight: 700;
        }
        .custom-text em {
            font-style: italic;
        }

        /* Code styling */
        .custom-text pre {
            background-color: #f8f9fa;
            border-radius: 0.25rem;
            padding: 1rem;
            overflow-x: auto;
            margin-bottom: 1rem;
        }
        .custom-text code {
            font-family: monospace;
            background-color: #f1f1f1;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
        }
        .custom-text pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            font-size: 0.875em;
        }

        /* Blockquote styling */
        .custom-text blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            font-style: italic;
            margin: 1rem 0;
            color: #4b5563;
        }

        /* Links */
        .custom-text a {
            color: #f3ca14 !important;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .custom-text a:hover {
            text-decoration: underline;
            font-weight: 600;
        }

        /* Ensure mentions display correctly inline */
        .mention-tag,
        .mention {
            display: inline !important;
            white-space: nowrap !important;
            vertical-align: baseline !important;
        }

        /* Ensure paragraphs have proper spacing */
        .custom-text p {
            margin-bottom: 1rem;
        }
        .custom-text p:last-child {
            margin-bottom: 0;
        }

        /* Dark mode adjustments */
        .custom-text-wrapper.dark pre,
        .custom-text-wrapper.dark code {
            background-color: #1f2937;
            color: #e5e7eb;
        }
        .custom-text-wrapper.dark blockquote {
            border-left-color: #4b5563;
            color: #9ca3af;
        }
    `}</style>
);

export default CustomMarkdownPreview;

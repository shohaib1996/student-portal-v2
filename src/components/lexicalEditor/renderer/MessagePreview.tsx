'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Highlighter from 'react-highlight-words';

// Dynamic import of markdown preview component
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
    ssr: false,
});

interface MessagePreviewProps {
    text: string;
    searchQuery?: string;
    isUser?: boolean;
}

function transformMessage(text?: string): string {
    if (!text) {
        return '';
    }
    return text.replace(
        /@\[(.*?)\]\((.*?)\)/g,
        '<span class="mention text-yellow-500 hover:underline cursor-pointer" data-user-id="$2" data-user-name="$1">@$1</span>',
    );
}

const components = {
    a: ({
        node,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { node?: any }) => (
        <a target='_blank' rel='noopener noreferrer' {...props} />
    ),
};

const transformDate = (text?: string): string => {
    if (!text) {
        return '';
    }
    const regexPattern = /\{\{DATE:(.*?)\}\}/g;
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return text.replace(regexPattern, (match, startTime) => {
        return `${dayjs(startTime).format('MMMM D YYYY, h:mm A')} (${userTimezone})`;
    });
};

function MessagePreview({ text, searchQuery, isUser }: MessagePreviewProps) {
    const { theme } = useTheme();

    // Transform the text first
    const processedText = transformDate(transformMessage(text));

    // Highlight only the text content, leaving markdown parsing to MarkdownPreview
    const highlightedContent = searchQuery ? (
        <Highlighter
            highlightClassName='bg-yellow-200 text-black rounded-sm px-0.5'
            searchWords={[searchQuery]}
            autoEscape={true}
            textToHighlight={processedText}
        />
    ) : (
        processedText
    );

    return (
        <div className='message-preview'>
            <MarkdownPreview
                source={processedText}
                components={components}
                wrapperElement={{
                    'data-color-mode': theme === 'dark' ? 'dark' : 'light',
                }}
                className={`${isUser ? '!text-pure-white/80 dark:!text-pure-white/80' : '!text-gray dark:!text-pure-white/90'} `}
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

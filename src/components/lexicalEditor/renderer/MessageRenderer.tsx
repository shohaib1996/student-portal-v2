'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Highlighter from 'react-highlight-words';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';

// Dynamic import of markdown preview component
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
    ssr: false,
});

interface MessageRendererProps {
    text: string;
    searchQuery?: string;
    isUser?: boolean;
}

function transformMessage(text?: string): string {
    if (!text) {
        return '';
    }

    return text.replace(
        /@\[([^\]]+)\]$$[^$$]+\)/g,
        '<span class="bg-green-100/20 text-green-600 dark:bg-green-900/30 dark:text-green-400 font-bold">@$1</span>',
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

function MessageRenderer({ text, searchQuery, isUser }: MessageRendererProps) {
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
            {/* <MarkdownPreview
                source={processedText}
                components={components}
                wrapperElement={{
                    'data-color-mode': theme === 'dark' ? 'dark' : 'light',
                }}
                className={`${isUser ? '!text-pure-white/80 dark:!text-pure-white/80' : '!text-gray dark:!text-pure-white/90'} `}
            /> */}
            {renderText({ text: processedText || '' })}
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

export default MessageRenderer;

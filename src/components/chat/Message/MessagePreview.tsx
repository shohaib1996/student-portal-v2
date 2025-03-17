'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

// Dynamic import of markdown preview component
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
    ssr: false,
});

interface MessagePreviewProps {
    text: string;
}

interface RootState {
    theme: {
        displayMode: string;
    };
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

function MessagePreview({ text }: MessagePreviewProps) {
    const { displayMode } = useSelector((state: RootState) => state.theme);

    return (
        <div className='message-preview'>
            <MarkdownPreview
                source={transformDate(transformMessage(text))}
                components={components}
                wrapperElement={{
                    'data-color-mode':
                        displayMode === 'dark' ? 'dark' : 'light',
                }}
                className={`text-gray-700 dark:text-gray-300`}
            />
        </div>
    );
}

export default MessagePreview;

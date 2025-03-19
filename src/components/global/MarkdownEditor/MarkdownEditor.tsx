import { cn } from '@/lib/utils';
import { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import React, { forwardRef } from 'react';
import './markdown.css';

const Editor = dynamic(() => import('./MarkdownEditorIniitalizer'), {
    // Make sure we turn SSR off
    ssr: false,
});

export const MarkdownEditor = forwardRef<
    MDXEditorMethods,
    MDXEditorProps & { className?: string }
>(({ className, ...props }, ref) => {
    const { theme } = useTheme();

    return (
        <Editor
            className={cn(
                theme,
                `markdown-editor border border-forground-border rounded-md bg-background-foreground`,
                className,
            )}
            {...props}
            editorRef={ref}
        />
    );
});

MarkdownEditor.displayName = 'ForwardRefEditor';

'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
    oneLight,
    oneDark,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from './CustomMarkdownPreview.module.css';

interface CustomMarkdownPreviewProps {
    source: string;
    components?: Record<string, React.ComponentType<any>>;
    className?: string;
    wrapperElement?: any;
}

const CustomMarkdownPreview: React.FC<CustomMarkdownPreviewProps> = ({
    source,
    components: customComponents = {},
    className = '',
    wrapperElement = {},
}) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Handle hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle empty or undefined source
    if (!source) {
        return null;
    }

    // Preprocess the source to handle consecutive newlines more effectively
    // This will help maintain the visual separation seen in the chat bubble
    const processedSource = source.replace(/\n/g, '\n\n');

    const isDarkMode =
        theme === 'dark' || wrapperElement['data-color-mode'] === 'dark';

    // Combine default components with custom components
    const components = {
        // Add code block syntax highlighting
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match && match[1] ? match[1] : '';

            return !inline && language ? (
                <SyntaxHighlighter
                    style={isDarkMode ? oneDark : oneLight}
                    language={language}
                    PreTag='div'
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },

        // Use pre tag for proper content spacing
        pre({ children, ...props }: any) {
            return (
                <pre className={styles.pre} {...props}>
                    {children}
                </pre>
            );
        },

        // Enhanced paragraph component for better line breaks
        p({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
            // For basic strings without links, use the div-based approach
            if (typeof children === 'string' && !children.includes('[')) {
                return (
                    <div className={styles.lineBreaksEnhanced}>
                        {children.split('\n').map((line, i) => (
                            <div key={i} style={{ marginBottom: '1em' }}>
                                {line}
                            </div>
                        ))}
                    </div>
                );
            }

            // For content that might contain links (including mentions),
            // use the standard paragraph with pre-line styling to preserve both links and line breaks
            return (
                <p style={{ whiteSpace: 'pre-line' }} {...props}>
                    {children}
                </p>
            );
        },

        // Ensure links open in new tab by default
        a({
            node,
            href,
            children,
            ...props
        }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { node?: any }) {
            if (customComponents.a) {
                const CustomLink = customComponents.a;
                return (
                    <CustomLink node={node} href={href} {...props}>
                        {children}
                    </CustomLink>
                );
            }

            return (
                <a
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    {...props}
                >
                    {children}
                </a>
            );
        },

        // Add any additional custom components
        ...customComponents,
    };

    return mounted ? (
        <div
            className={`${styles.markdownContainer} ${className}`}
            data-color-mode={wrapperElement['data-color-mode'] || theme}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={components}
            >
                {processedSource}
            </ReactMarkdown>
        </div>
    ) : (
        <div className='markdown-preview-loading'>Loading...</div>
    );
};

export default CustomMarkdownPreview;

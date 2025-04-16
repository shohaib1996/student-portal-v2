import React from 'react';

/**
 * Interface for Quill operation attributes
 */
interface QuillAttributes {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    link?: string;
    mention?: {
        id: string;
        value: string;
    };
    [key: string]: any; // For other attributes
}

/**
 * Interface for Quill operation insert
 */
interface QuillInsert {
    image?: string;
    mention?: {
        id: string;
        value: string;
    };
    [key: string]: any; // For other insert types
}

/**
 * Interface for Quill operation
 */
interface QuillOp {
    insert: string | QuillInsert;
    attributes?: QuillAttributes;
}

/**
 * Interface for Quill data
 */
interface QuillData {
    ops: QuillOp[];
}

/**
 * Props for the renderPlainText component
 */
interface PlainTextProps {
    text: string;
    textSize?: string; // Default will be "text-xs"
    textColor?: string; // Default will be "text-gray-700"
    lineClamp?: 1 | 2 | 3 | 4 | 5 | number; // Line clamp options
    width?: string; // Width control using Tailwind classes like w-full, w-32, etc.
    truncate?: boolean; // Whether to enable text truncation with ellipsis
}

/**
 * Renders text content as plain text, stripping all formatting and special characters
 * with control over line clamping, width, and truncation
 *
 * @param text The text content to render
 * @param textSize Optional CSS class for text size (defaults to text-xs)
 * @param textColor Optional CSS class for text color (defaults to text-gray-700)
 * @param lineClamp Optional line clamp value (1-5)
 * @param width Optional width using Tailwind classes
 * @param truncate Optional boolean to enable text truncation
 * @returns A React component rendering plain text
 */
export const renderPlainText = ({
    text,
    textSize = 'text-xs',
    textColor = 'text-gray-700',
    lineClamp,
    width,
    truncate = false,
}: PlainTextProps): React.ReactNode => {
    if (!text) {
        return null; // Handle empty text case
    }

    // Extract plain text from the input
    const plainText = extractPlainText(text);

    // Build className based on props
    const classNames = [
        'plain-text',
        textSize,
        textColor,
        width || '',
        truncate ? 'truncate' : '',
        lineClamp ? `line-clamp-${lineClamp}` : '',
    ]
        .filter(Boolean)
        .join(' ');

    return <div className={classNames}>{plainText}</div>;
};

/**
 * Main function to extract plain text from any input format
 */
const extractPlainText = (text: string): string => {
    // Handle empty input
    if (!text) {
        return '';
    }

    // First check if it's valid JSON (Quill or Lexical data)
    try {
        const obj = JSON.parse(text);

        // Check if this is a Quill editor object
        if (typeof obj === 'object' && obj !== null) {
            // Handle Quill format
            if (obj.ops && Array.isArray(obj.ops)) {
                return extractPlainTextFromQuill(obj as QuillData);
            }
            // Handle Lexical format
            else if (obj.root && obj.root.children) {
                return extractPlainTextFromLexical(obj);
            } else {
                // If JSON parsed but isn't a recognized format, convert to string
                return JSON.stringify(obj);
            }
        } else {
            // If JSON parsed but isn't an object
            return String(obj);
        }
    } catch (error) {
        // Not JSON, try handling as Markdown or HTML
        return stripFormattingAndExtractText(text);
    }
};

/**
 * Extracts plain text from Quill data structure, including mentions
 */
const extractPlainTextFromQuill = (quillData: QuillData): string => {
    let plainText = '';

    quillData.ops.forEach((op) => {
        if (typeof op.insert === 'string') {
            plainText += op.insert;
        } else if (op.insert && typeof op.insert === 'object') {
            // Handle mentions
            if ('mention' in op.insert && op.insert.mention) {
                plainText += `@${op.insert.mention.value} `;
            }
            // Handle other embeds (like images) by adding placeholder text
            else if ('image' in op.insert) {
                plainText += '[image] ';
            }
        }
    });

    return plainText;
};

/**
 * Extracts plain text from Lexical editor state
 */
const extractPlainTextFromLexical = (lexicalState: any): string => {
    let plainText = '';

    // Basic recursive function to extract text from Lexical nodes
    const extractTextFromNodes = (nodes: any[]) => {
        if (!nodes || !Array.isArray(nodes)) {
            return;
        }

        nodes.forEach((node) => {
            // Text nodes
            if (node.type === 'text') {
                plainText += node.text || '';
            }
            // Mention nodes
            else if (node.type === 'mention') {
                plainText += `@${node.text || node.mentionName || ''} `;
            }
            // Handle other node types with children
            else if (node.children && Array.isArray(node.children)) {
                extractTextFromNodes(node.children);
                // Add newline after block-level elements
                if (
                    ['paragraph', 'heading', 'list-item', 'quote'].includes(
                        node.type,
                    )
                ) {
                    plainText += ' ';
                }
            }
        });
    };

    if (lexicalState.root && lexicalState.root.children) {
        extractTextFromNodes(lexicalState.root.children);
    }

    return plainText.trim();
};

/**
 * Strips HTML and Markdown formatting and extracts plain text
 */
const stripFormattingAndExtractText = (text: string): string => {
    // First attempt to use DOM parsing for HTML
    try {
        // Use DOM parser to handle HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Check if parsing was successful
        if (doc.body) {
            // Extract and process text content
            let content = doc.body.textContent || '';

            // Further clean up common Markdown syntax
            content = cleanMarkdownSyntax(content);

            return content;
        }
    } catch (e) {
        // Fallback if DOM parser is not available or fails
    }

    // Fallback: Manual HTML tag stripping using regex
    let plainText = text.replace(/<[^>]*>/g, ' ');

    // Clean up Markdown syntax
    plainText = cleanMarkdownSyntax(plainText);

    // Clean up whitespace
    plainText = plainText.replace(/\s+/g, ' ').trim();

    return plainText;
};

/**
 * Cleans up common Markdown syntax
 */
const cleanMarkdownSyntax = (text: string): string => {
    // Remove headers (# Header)
    let cleaned = text.replace(/#{1,6}\s+/g, '');

    // Remove bold/italic markers (* or _)
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2'); // Italic

    // Remove code blocks and inline code
    cleaned = cleaned.replace(/```[\s\S]*?```/g, ''); // Code blocks
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Inline code

    // Remove link syntax [text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove image syntax ![alt](url)
    cleaned = cleaned.replace(/!\[([^\]]+)\]\([^)]+\)/g, '[image]');

    // Remove blockquotes
    cleaned = cleaned.replace(/^\s*>\s*/gm, '');

    // Remove horizontal rules
    // eslint-disable-next-line no-useless-escape
    cleaned = cleaned.replace(/^(\s*[\-=_*]\s*){3,}\s*$/gm, '');

    // Remove list markers
    // eslint-disable-next-line no-useless-escape
    cleaned = cleaned.replace(/^\s*[\-*+]\s+/gm, ''); // Unordered lists
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // Ordered lists

    return cleaned;
};

/**
 * Utility function to convert text to plain text
 * Can be exported and used directly
 */
export const convertToPlainText = extractPlainText;

import React from 'react';
import MessagePreview from '@/components/lexicalEditor/renderer/MessagePreview';
import LexicalJsonRenderer from '@/components/lexicalEditor/renderer/JsonRenderer';
import ReactHtmlParser from 'react-html-parser';

/**
 * Interface for Quill operation attributes
 */
interface QuillAttributes {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    link?: string;
    [key: string]: any; // For other attributes
}

/**
 * Interface for Quill operation insert
 */
interface QuillInsert {
    image?: string;
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
 * Renders text content conditionally as Lexical JSON, Quill data, HTML, or plain text
 * @param text The text content to render
 * @returns A React component rendering the appropriate format
 */
export const renderText = ({
    text,
    bgColor,
    toc,
}: {
    text: string;
    bgColor?: 'background' | 'foreground';
    toc?: boolean;
}): React.ReactNode => {
    if (!text) {
        return null; // Handle empty text case
    }

    // First check if it's valid JSON
    try {
        const obj = JSON.parse(text);
        // Check if this is a Quill editor object
        if (typeof obj === 'object' && obj !== null) {
            // Check for Quill editor data structure
            if (obj.ops && Array.isArray(obj.ops)) {
                return renderQuillContent(obj as QuillData);
            }

            // Check for Lexical editor structure
            return (
                <LexicalJsonRenderer
                    lexicalState={obj}
                    showTOC={toc}
                    bgColor={bgColor ? bgColor : 'background'}
                />
            );
        } else {
            // If JSON parsed but isn't the right object type, check if it contains HTML
            return determineAndRenderContent(text);
        }
    } catch (error) {
        // If parsing fails (not JSON), check if it contains HTML
        return determineAndRenderContent(text);
    }
};

/**
 * Helper function to determine if text is primarily HTML and render appropriately
 */
const determineAndRenderContent = (text: string): React.ReactNode => {
    // Check for markdown code blocks that might contain HTML
    const codeBlockRegex = /```[\s\S]*?```/g;
    const hasCodeBlocks = codeBlockRegex.test(text);

    // If there are code blocks, treat as markdown to preserve them
    if (hasCodeBlocks) {
        return <MessagePreview text={text} />;
    }

    // Check if text appears to be primarily HTML
    // More robust check for HTML - looking for common HTML document structure
    const htmlTags = text.match(/<[^>]+>/g);
    const isPrimarilyHtml =
        // If it starts with <!DOCTYPE html> or <html>
        /^\s*(?:<!DOCTYPE\s+html|<html)/i.test(text) ||
        // Or if it contains multiple HTML tags and they make up a significant portion of the content
        (/<[a-z][\s\S]*>/i.test(text) &&
            htmlTags !== null &&
            htmlTags.length > 3 &&
            htmlTags.join('').length > text.length * 0.3);

    if (isPrimarilyHtml) {
        // Use html-react-parser to render HTML
        return <div className='html-content'>{ReactHtmlParser(text)}</div>;
    } else {
        // Render as plain text or markdown
        return <MessagePreview text={text} />;
    }
};

/**
 * Renders Quill editor content
 * @param quillData The Quill editor data object
 * @returns React component with parsed HTML
 */
const renderQuillContent = (quillData: QuillData): React.ReactNode => {
    // Convert Quill data to HTML
    let html = '';

    quillData.ops.forEach((op) => {
        if (typeof op.insert === 'string') {
            let text = op.insert;

            // Handle basic formatting
            if (op.attributes) {
                if (op.attributes.bold) {
                    text = `<strong>${text}</strong>`;
                }
                if (op.attributes.italic) {
                    text = `<em>${text}</em>`;
                }
                if (op.attributes.underline) {
                    text = `<u>${text}</u>`;
                }
                if (op.attributes.strike) {
                    text = `<s>${text}</s>`;
                }
                if (op.attributes.link) {
                    text = `<a href="${op.attributes.link}">${text}</a>`;
                }
                // Add more formatting handlers as needed
            }

            html += text;
        } else if (op.insert && typeof op.insert === 'object') {
            // Handle embeds, images, etc.
            if ('image' in op.insert && op.insert.image) {
                html += `<img src="${op.insert.image}" alt="Embedded image" />`;
            }
            // Handle other embed types as needed
        }
    });

    // Wrap with line breaks as needed
    html = html.replace(/\n/g, '<br />');

    return <div className='quill-content'>{ReactHtmlParser(html)}</div>;
};

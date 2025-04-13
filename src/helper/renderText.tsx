import React from 'react';
import MessagePreview from '@/components/chat/Message/MessagePreview';
import LexicalJsonRenderer from '@/components/lexicalEditor/renderer/JsonRenderer';
import parse from 'html-react-parser';

export const renderText = (text: string) => {
    if (!text) {
        return <></>; // Handle empty text case
    }

    // First check if it's valid JSON
    try {
        const obj = JSON.parse(text);

        // Check if this is a Quill editor object
        if (typeof obj === 'object' && obj !== null) {
            // Check for Quill editor data structure
            if (obj.ops && Array.isArray(obj.ops)) {
                return renderQuillContent(obj);
            }

            // Check for Lexical editor structure
            return <LexicalJsonRenderer lexicalState={obj} />;
        } else {
            // If JSON parsed but isn't the right object type, check if it contains HTML
            return checkAndRenderHtml(text);
        }
    } catch (error) {
        // If parsing fails (not JSON), check if it contains HTML
        return checkAndRenderHtml(text);
    }
};

const checkAndRenderHtml = (text: string) => {
    // Check if text contains HTML tags
    const containsHtml = /<[a-z][\s\S]*>/i.test(text);

    if (containsHtml) {
        // Use html-react-parser to render HTML
        return <>{parse(text)}</>;
    } else {
        // Render plain text with line breaks
        const withLineBreaks = text.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
                {line}
                <br />
            </React.Fragment>
        ));
        return <>{withLineBreaks}</>;
    }
};

const renderQuillContent = (quillData: { ops: any[] }) => {
    // Convert Quill data to HTML
    // This is a simplified implementation - you may need a more robust conversion
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
            if (op.insert.image) {
                html += `<img src="${op.insert.image}" alt="Embedded image" />`;
            }
            // Handle other embed types as needed
        }
    });

    // Wrap with line breaks as needed
    html = html.replace(/\n/g, '<br />');

    return <div className='quill-content'>{parse(html)}</div>;
};

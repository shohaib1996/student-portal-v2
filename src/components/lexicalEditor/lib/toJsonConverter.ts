/**
 * Utility function to convert different text formats to Lexical editor JSON format
 * @param {string} inputString - The string to convert (JSON, Markdown, or HTML)
 * @returns {object} - Lexical editor compatible JSON object
 */
function convertToLexicalFormat(inputString: string): Record<string, any> {
    // Trim the input string
    const trimmedInput = inputString.trim();

    // Try to parse as JSON first
    try {
        const parsedJson = JSON.parse(trimmedInput);
        // Check if it's already in Lexical format
        if (parsedJson.root && parsedJson.root.type === 'root') {
            return parsedJson; // Already in Lexical format
        }
        // If it's JSON but not Lexical format, convert it to text nodes
        return createLexicalJson(JSON.stringify(parsedJson));
    } catch (e) {
        // Not valid JSON, check if it's HTML
        if (
            trimmedInput.startsWith('<') &&
            (trimmedInput.includes('</') || trimmedInput.includes('/>'))
        ) {
            return convertHtmlToLexical(trimmedInput);
        }
        // Otherwise treat as Markdown
        return convertMarkdownToLexical(trimmedInput);
    }
}

/**
 * Interface for Lexical node types
 */
interface LexicalNode {
    type: string;
    version: number;
    [key: string]: any;
}

/**
 * Interface for Lexical text node
 */
interface LexicalTextNode extends LexicalNode {
    type: 'text';
    text: string;
    detail: number;
    format: number;
    mode: string;
    style: string;
}

/**
 * Interface for Lexical paragraph node
 */
interface LexicalParagraphNode extends LexicalNode {
    type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    children: LexicalNode[];
    direction: string;
    format: string;
    indent: number;
}

/**
 * Interface for Lexical list item node
 */
interface LexicalListItemNode extends LexicalNode {
    type: 'listitem';
    children: LexicalNode[];
    direction: string;
    format: string;
    indent: number;
    value: number;
}

/**
 * Interface for Lexical list node
 */
interface LexicalListNode extends LexicalNode {
    type: 'ul' | 'ol';
    children: LexicalListItemNode[];
    direction: string;
    format: string;
    indent: number;
    listType: 'bullet' | 'number';
}

/**
 * Interface for Lexical root node
 */
interface LexicalRootNode extends LexicalNode {
    type: 'root';
    children: LexicalNode[];
    direction: string;
    format: string;
    indent: number;
}

/**
 * Interface for Lexical document
 */
interface LexicalDocument {
    root: LexicalRootNode;
}

/**
 * Creates a basic Lexical JSON structure with text content
 * @param {string} content - Text content to include in the structure
 * @returns {LexicalDocument} - Lexical editor compatible JSON object
 */
function createLexicalJson(content: string): LexicalDocument {
    const textNode: LexicalTextNode = {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: content,
        type: 'text',
        version: 1,
    };

    const paragraphNode: LexicalParagraphNode = {
        children: [textNode],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
    };

    const rootNode: LexicalRootNode = {
        children: [paragraphNode],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    };

    return { root: rootNode };
}

/**
 * Converts HTML string to Lexical JSON format
 * @param {string} htmlString - HTML string to convert
 * @returns {LexicalDocument} - Lexical editor compatible JSON object
 */
function convertHtmlToLexical(htmlString: string): LexicalDocument {
    // Basic implementation - in a real application, you would use a proper HTML parser
    // and handle different HTML elements appropriately

    // Create temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Extract text content
    const textContent = tempDiv.textContent || tempDiv.innerText || htmlString;

    // Create Lexical JSON with the extracted content
    const rootChildren: LexicalParagraphNode[] = [];

    // Split by line breaks to create paragraphs
    const paragraphs = textContent
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '');

    paragraphs.forEach((paragraph) => {
        const textNode: LexicalTextNode = {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: paragraph,
            type: 'text',
            version: 1,
        };

        const paragraphNode: LexicalParagraphNode = {
            children: [textNode],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
        };

        rootChildren.push(paragraphNode);
    });

    // If no paragraphs were found, create at least one
    if (rootChildren.length === 0) {
        const textNode: LexicalTextNode = {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: textContent,
            type: 'text',
            version: 1,
        };

        const paragraphNode: LexicalParagraphNode = {
            children: [textNode],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
        };

        rootChildren.push(paragraphNode);
    }

    const rootNode: LexicalRootNode = {
        children: rootChildren,
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    };

    return { root: rootNode };
}

/**
 * Converts Markdown string to Lexical JSON format
 * @param {string} markdownString - Markdown string to convert
 * @returns {LexicalDocument} - Lexical editor compatible JSON object
 */
function convertMarkdownToLexical(markdownString: string): LexicalDocument {
    // Split the Markdown into lines
    const lines = markdownString.split(/\r?\n/);

    const rootChildren: LexicalNode[] = [];
    let currentListItems: LexicalListItemNode[] = [];
    let isInList = false;
    let listType: 'ul' | 'ol' = 'ul';

    lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Handle headers (# Header)
        const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const text = headerMatch[2];

            const textNode: LexicalTextNode = {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: text,
                type: 'text',
                version: 1,
            };

            const headerNode: LexicalParagraphNode = {
                children: [textNode],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
                version: 1,
            };

            rootChildren.push(headerNode);
            return;
        }

        // Handle unordered lists (- item or * item)
        // eslint-disable-next-line no-useless-escape
        const ulMatch = trimmedLine.match(/^[\*\-]\s+(.+)$/);
        if (ulMatch) {
            if (isInList && listType !== 'ul') {
                // Flush the current list if it's a different type
                flushList();
            }

            isInList = true;
            listType = 'ul';

            const textNode: LexicalTextNode = {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: ulMatch[1],
                type: 'text',
                version: 1,
            };

            const listItemNode: LexicalListItemNode = {
                children: [textNode],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'listitem',
                value: 1,
                version: 1,
            };

            currentListItems.push(listItemNode);
            return;
        }

        // Handle ordered lists (1. item)
        const olMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
        if (olMatch) {
            if (isInList && listType !== 'ol') {
                // Flush the current list if it's a different type
                flushList();
            }

            isInList = true;
            listType = 'ol';

            const textNode: LexicalTextNode = {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: olMatch[2],
                type: 'text',
                version: 1,
            };

            const listItemNode: LexicalListItemNode = {
                children: [textNode],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'listitem',
                value: parseInt(olMatch[1], 10),
                version: 1,
            };

            currentListItems.push(listItemNode);
            return;
        }

        // If we're not continuing a list, flush any current list
        if (isInList && trimmedLine !== '') {
            flushList();
        }

        // Handle normal paragraphs
        if (trimmedLine !== '') {
            const textNode: LexicalTextNode = {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: trimmedLine,
                type: 'text',
                version: 1,
            };

            const paragraphNode: LexicalParagraphNode = {
                children: [textNode],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
            };

            rootChildren.push(paragraphNode);
        }
    });

    // Flush any remaining list items
    if (isInList) {
        flushList();
    }

    // Helper function to add current list to rootChildren
    function flushList(): void {
        if (currentListItems.length > 0) {
            const listNode: LexicalListNode = {
                children: currentListItems,
                direction: 'ltr',
                format: '',
                indent: 0,
                type: listType,
                version: 1,
                listType: listType === 'ol' ? 'number' : 'bullet',
            };

            rootChildren.push(listNode);

            currentListItems = [];
            isInList = false;
            listType = 'ul';
        }
    }

    const rootNode: LexicalRootNode = {
        children: rootChildren,
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    };

    return { root: rootNode };
}

// Example usage:
// const inputString = "# Hello World\n\nThis is a paragraph.";
// const lexicalJson = convertToLexicalFormat(inputString);
// console.log(JSON.stringify(lexicalJson, null, 2));

export { convertToLexicalFormat };

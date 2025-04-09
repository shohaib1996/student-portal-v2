import React, { useEffect, useRef } from 'react';

/** -------------------------------------------------------------------------
 * Type Definitions
 * ------------------------------------------------------------------------- */

type HeadingData = {
    level: number;
    text: string;
    id: string;
};

type LexicalState = {
    root?: {
        children?: LexicalNode[];
    };
};

// A minimal definition for any Lexical node shape
// (You can expand this if you want stricter types per node type.)
type LexicalNode = {
    type?: string;
    text?: string;
    style?: string;
    format?: any;
    mode?: string;
    children?: LexicalNode[];

    // List
    listType?: string;
    checked?: boolean;

    // Heading
    tag?: string;
    level?: number;

    // Link
    url?: string;
    newTab?: boolean;
    target?: string;

    // Image
    src?: string;
    altText?: string;
    width?: number;
    height?: number;
    caption?: string;
    showCaption?: boolean;
    alignment?: string;

    // Code
    language?: string;
    highlightType?: string;

    // Table
    colWidths?: number[];
    headerState?: number;
    header?: boolean;
    isHeader?: boolean;
    colSpan?: number;
    rowSpan?: number;
    backgroundColor?: string;

    // Collapsible
    open?: boolean;

    // Poll
    question?: string;
    options?: {
        uid?: string;
        text?: string;
    }[];

    // Layout
    templateColumns?: string;
    columns?: number;

    // Equation
    equation?: string;
    latex?: string;

    // Emoji
    emoji?: string;

    // Hashtag
    hashtag?: string;

    // Mentions
    trigger?: string;
    value?: string;
    data?: any; // Usually mention-specific or excalidraw data

    tweetId?: string;
    videoId?: string;
    figmaUrl?: string;

    // (Excalidraw)
    // node.data could be a JSON string, etc.
};

/** -------------------------------------------------------------------------
 * Component Props
 * ------------------------------------------------------------------------- */
interface LexicalJsonRendererProps {
    /**
     * The Lexical editor state JSON from the database
     */
    lexicalState?: LexicalState | null;

    /**
     * Whether to display a Table of Contents at the top
     * @default false
     */
    showTOC?: boolean;

    /**
     * Additional CSS classes for the container
     */
    className?: string;
}

/** -------------------------------------------------------------------------
 * React Component
 * ------------------------------------------------------------------------- */
const LexicalJsonRenderer: React.FC<LexicalJsonRendererProps> = ({
    lexicalState,
    showTOC = false,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !lexicalState) {
            return;
        }

        // Clear previous content
        containerRef.current.innerHTML = '';

        // Generate HTML content and headings list from the lexical JSON state
        const { contentContainer, headings } = generateHtmlAndTOC(lexicalState);

        // If showTOC is true and we have headings, prepend the Table of Contents
        if (showTOC && headings.length > 0) {
            const tocElement = createTOCElement(headings);
            containerRef.current.appendChild(tocElement);
        }

        // Append the main content
        containerRef.current.appendChild(contentContainer);
    }, [lexicalState, showTOC]);

    return (
        <div
            ref={containerRef}
            className={`lexical-rendered-content ${className}`}
            data-lexical-renderer='true'
        />
    );
};

export default LexicalJsonRenderer;

/** -------------------------------------------------------------------------
 * generateHtmlAndTOC
 *
 * Given a LexicalState object, creates a parent <div> containing the rendered
 * HTML, and also returns a list of headings for the Table of Contents.
 * ------------------------------------------------------------------------- */
function generateHtmlAndTOC(lexicalState: LexicalState): {
    contentContainer: HTMLDivElement;
    headings: HeadingData[];
} {
    const contentContainer = document.createElement('div');
    contentContainer.className = 'lexical-content';

    const headings: HeadingData[] = [];

    if (lexicalState.root?.children) {
        lexicalState.root.children.forEach((node) => {
            const nodeElement = processNode(node, headings);
            if (nodeElement) {
                contentContainer.appendChild(nodeElement);
            }
        });
    }

    return { contentContainer, headings };
}

/** -------------------------------------------------------------------------
 * createTOCElement
 *
 * Builds an HTML <div> containing a "Table of Contents" heading + a list of
 * links to each heading found in the Lexical JSON.
 * ------------------------------------------------------------------------- */
function createTOCElement(headings: HeadingData[]): HTMLDivElement {
    const tocWrapper = document.createElement('div');
    tocWrapper.className = 'mb-6 border border-gray-200 p-4 rounded bg-gray-50';

    // TOC title
    const tocTitle = document.createElement('h2');
    tocTitle.className = 'text-lg font-semibold mb-3';
    tocTitle.textContent = 'Table of Contents';
    tocWrapper.appendChild(tocTitle);

    // TOC list
    const tocList = document.createElement('ul');
    tocList.className = 'space-y-1';
    tocWrapper.appendChild(tocList);

    headings.forEach(({ level, text, id }) => {
        const listItem = document.createElement('li');
        // Indentation based on heading level
        listItem.style.marginLeft = `${(level - 1) * 12}px`;

        // Create anchor
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.className = 'text-blue-600 hover:underline';
        link.textContent = text;

        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });

    return tocWrapper;
}

/** -------------------------------------------------------------------------
 * processNode
 *
 * Takes a single Lexical node from the JSON tree, and returns an HTMLElement
 * or Text node. Also populates the `headings` array for the TOC if it
 * encounters heading nodes.
 * ------------------------------------------------------------------------- */
function processNode(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLElement | Text | null {
    if (!node || !node.type) {
        return null;
    }

    // Handle text nodes
    if (node.type === 'text') {
        // If it's just plain text with no formatting
        if (!node.format && !node.style && !node.mode) {
            return document.createTextNode(node.text || '');
        }

        // Otherwise, create a span for formatted text
        const span = document.createElement('span');
        span.textContent = node.text || '';

        // Apply text formatting with Tailwind classes
        if (node.format) {
            // Each bit in the format is a separate style. Lexical uses numeric bitmasks:
            // 1: bold, 2: italic, 4: underline, 8: strikethrough, 16: superscript,
            // 32: subscript, 64: code.
            if (node.format & 1) {
                span.classList.add('font-bold');
            } // Bold
            if (node.format & 2) {
                span.classList.add('italic');
            } // Italic
            if (node.format & 4) {
                span.classList.add('underline');
            } // Underline
            if (node.format & 8) {
                span.classList.add('line-through');
            } // Strikethrough
            if (node.format & 16) {
                span.classList.add('text-xs', 'align-super');
            } // Superscript
            if (node.format & 32) {
                span.classList.add('text-xs', 'align-sub');
            } // Subscript
            if (node.format & 64) {
                span.classList.add(
                    'font-mono',
                    'bg-gray-100',
                    'px-1',
                    'rounded',
                );
            } // Code
        }

        // Apply custom inline styles
        if (node.style) {
            applyStyleToElement(span, node.style);
        }

        return span;
    }

    // Handle different element types
    switch (node.type) {
        case 'paragraph':
            return createParagraph(node, headings);

        case 'heading':
            return createHeading(node, headings);

        case 'list':
            if (node.listType === 'check') {
                return createCheckList(node, headings);
            } else {
                return createList(node, headings);
            }

        case 'listitem':
            if (Object.prototype.hasOwnProperty.call(node, 'checked')) {
                return createCheckListItem(node, headings);
            }
            return createListItem(node, headings);

        case 'check-list':
        case 'checkList':
        case 'checklist':
            return createCheckList(node, headings);

        case 'check-list-item':
        case 'checkListItem':
        case 'checklistitem':
            return createCheckListItem(node, headings);

        case 'quote':
            return createQuote(node, headings);

        case 'code':
            return createCode(node, headings);

        case 'horizontalrule':
        case 'hr':
            return createHorizontalRule();

        case 'page-break':
            return createPageBreak();

        case 'link':
            return createLink(node, headings);

        case 'image':
            return createImage(node);

        case 'inline-image':
            return createInlineImage(node);

        case 'tweet':
        case 'twitter':
            return createEmbedElement(node, 'twitter');

        case 'youtube':
            return createEmbedElement(node, 'youtube');

        case 'figma':
            return createEmbedElement(node, 'figma');

        case 'table':
            return createTable(node, headings);

        case 'tablerow':
            return createTableRow(node, headings);

        case 'tablecell':
            return createTableCell(node);

        case 'collapsible':
        case 'collapsible-container':
            return createCollapsible(node, headings);

        case 'collapsible-title':
            return createCollapsibleTitle(node, headings);

        case 'collapsible-content':
            return createCollapsibleContent(node, headings);

        case 'excalidraw':
            return createExcalidraw(node);

        case 'columns':
        case 'layout-container':
            return createColumnsLayout(node, headings);

        case 'layout-item':
        case 'column':
            return createColumn(node, headings);

        case 'equation':
            return createEquation(node);

        case 'emoji':
            return createEmoji(node);

        case 'hashtag':
            return createHashtag(node);

        case 'beautifulMention':
            return createMention(node);

        case 'poll':
            return createPoll(node);
    }

    // Fallback: if unknown node type or has children, process recursively
    if (node.children) {
        const div = document.createElement('div');
        node.children.forEach((child) => {
            const childElement = processNode(child, headings);
            if (childElement) {
                div.appendChild(childElement);
            }
        });
        return div;
    }

    return null;
}

/** -------------------------------------------------------------------------
 * createParagraph
 * ------------------------------------------------------------------------- */
function createParagraph(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLElement {
    const paragraph = document.createElement('p');
    paragraph.className = 'mb-4';

    // If node.format includes alignment info
    if (node.format && node.format.includes('align')) {
        const alignClass = getAlignmentClass(node.format);
        if (alignClass) {
            paragraph.classList.add(alignClass);
        }
    }

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                paragraph.appendChild(childElement);
            }
        });
    }

    return paragraph;
}

/** -------------------------------------------------------------------------
 * createHeading
 * ------------------------------------------------------------------------- */
function createHeading(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLElement {
    // Determine heading level (try node.tag first, else node.level, else default 1)
    let level = 1;
    if (node.tag) {
        const extracted = parseInt(node.tag.replace('h', ''), 10);
        level = isNaN(extracted) ? 1 : extracted;
    } else if (node.level) {
        level = node.level;
    }

    // Clamp level to 1–6
    if (level < 1 || level > 6) {
        level = 1;
    }

    // Construct the heading
    const headingTag = `h${level}` as keyof HTMLElementTagNameMap;
    const heading = document.createElement(headingTag);

    let headingText = '';

    // Basic Tailwind style by level
    switch (level) {
        case 1:
            heading.className = 'text-3xl font-bold mb-4';
            break;
        case 2:
            heading.className = 'text-2xl font-bold mb-3';
            break;
        case 3:
            heading.className = 'text-xl font-bold mb-2';
            break;
        default:
            heading.className = 'text-lg font-semibold mb-2';
            break;
    }

    // If node.format includes alignment
    if (node.format && node.format.includes('align')) {
        const alignClass = getAlignmentClass(node.format);
        if (alignClass) {
            heading.classList.add(alignClass);
        }
    }

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                heading.appendChild(childElement);

                // Gather text content for the TOC
                if (childNode.type === 'text' && childNode.text) {
                    headingText += childNode.text;
                }
            }
        });
    }

    if (node.text) {
        headingText += node.text;
        heading.textContent = headingText;
    }

    // Create an ID for anchor linking
    const headingId = createUniqueHeadingId(headingText);
    heading.setAttribute('id', headingId);

    // Add to headings array
    headings.push({
        level,
        text: headingText.trim() || 'Untitled Heading',
        id: headingId,
    });

    return heading;
}

/** -------------------------------------------------------------------------
 * createList
 * ------------------------------------------------------------------------- */
function createList(node: LexicalNode, headings: HeadingData[]): HTMLElement {
    const listType = node.listType || node.tag || 'bullet';
    const isNumbered = listType === 'number' || listType === 'ordered';

    const list = document.createElement(isNumbered ? 'ol' : 'ul');
    list.className = 'pl-5 mb-4';

    if (isNumbered) {
        list.classList.add('list-decimal');
    } else {
        list.classList.add('list-disc');
    }

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                list.appendChild(childElement);
            }
        });
    }

    return list;
}

/** -------------------------------------------------------------------------
 * createListItem
 * ------------------------------------------------------------------------- */
function createListItem(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLElement {
    const item = document.createElement('li');
    item.className = 'mb-1';

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                item.appendChild(childElement);
            }
        });
    }

    return item;
}

/** -------------------------------------------------------------------------
 * createCheckList
 * ------------------------------------------------------------------------- */
function createCheckList(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLElement {
    const list = document.createElement('ul');
    list.className = 'pl-5 mb-4 list-none';

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                list.appendChild(childElement);
            }
        });
    }

    return list;
}

/** -------------------------------------------------------------------------
 * createCheckListItem
 * ------------------------------------------------------------------------- */
function createCheckListItem(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLElement {
    const item = document.createElement('li');
    item.className = 'mb-1 flex items-start';

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-2 mt-1';
    checkbox.disabled = true;
    if (node.checked) {
        checkbox.checked = true;
    }

    item.appendChild(checkbox);

    // Container for text
    const content = document.createElement('div');
    content.className = 'flex-1';

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                content.appendChild(childElement);
            }
        });
    }

    item.appendChild(content);
    return item;
}

/** -------------------------------------------------------------------------
 * createQuote
 * ------------------------------------------------------------------------- */
function createQuote(node: LexicalNode, headings: HeadingData[]): HTMLElement {
    const quote = document.createElement('blockquote');
    quote.className = 'pl-4 border-l-4 border-gray-300 italic my-4';

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                quote.appendChild(childElement);
            }
        });
    }

    return quote;
}

/** -------------------------------------------------------------------------
 * createCode
 * ------------------------------------------------------------------------- */
function createCode(node: LexicalNode, headings: HeadingData[]): HTMLElement {
    // Wrapper for code block + copy button
    const codeBlockWrapper = document.createElement('div');
    codeBlockWrapper.className = 'relative my-4';

    // <pre><code> container
    const pre = document.createElement('pre');
    pre.className = 'bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto';

    // If a language is specified
    if (node.language) {
        const lang = node.language.toLowerCase();
        pre.classList.add(`language-${lang}`);

        // Add a small language tag in top-right corner
        const langTag = document.createElement('div');
        langTag.className =
            'absolute top-0 right-0 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-bl';
        langTag.textContent = node.language;
        codeBlockWrapper.appendChild(langTag);
    }

    // Copy button
    const copyButton = document.createElement('button');
    copyButton.className =
        'absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded';
    copyButton.title = 'Copy code';
    copyButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

    copyButton.addEventListener('click', () => {
        const codeText = code.textContent || '';
        navigator.clipboard.writeText(codeText).then(() => {
            // Show a small checkmark as feedback
            const original = copyButton.innerHTML;
            copyButton.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => {
                copyButton.innerHTML = original;
            }, 2000);
        });
    });

    // Create code area with line numbers
    const codeContainer = document.createElement('div');
    codeContainer.className = 'flex';

    // Column for line numbers
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'text-gray-400 pr-4 text-right select-none';
    lineNumbers.style.minWidth = '2rem';

    // Actual code output
    const code = document.createElement('code');
    code.className = 'flex-1';

    // We track line breaks. If children contain code-highlight tokens or linebreak
    let lineCount = 1;
    let currentLineSpan = document.createElement('span');

    if (node.children) {
        node.children.forEach((child) => {
            if (child.type === 'linebreak') {
                code.appendChild(currentLineSpan);
                code.appendChild(document.createElement('br'));
                lineCount++;
                currentLineSpan = document.createElement('span');
            } else if (child.type === 'code-highlight') {
                const tokenSpan = document.createElement('span');
                tokenSpan.textContent = child.text || '';
                if (child.highlightType) {
                    tokenSpan.classList.add(`token-${child.highlightType}`);
                }
                currentLineSpan.appendChild(tokenSpan);
            } else {
                const fallback = document.createElement('span');
                fallback.textContent = child.text || '';
                currentLineSpan.appendChild(fallback);
            }
        });
        // Add the final line if any content is present
        if (currentLineSpan.childNodes.length > 0) {
            code.appendChild(currentLineSpan);
        }
    }

    // Generate line numbers
    for (let i = 1; i <= lineCount; i++) {
        const lineSpan = document.createElement('span');
        lineSpan.textContent = String(i);
        lineSpan.className = 'block';
        lineNumbers.appendChild(lineSpan);
    }

    codeContainer.appendChild(lineNumbers);
    codeContainer.appendChild(code);
    pre.appendChild(codeContainer);

    codeBlockWrapper.appendChild(pre);
    codeBlockWrapper.appendChild(copyButton);

    return codeBlockWrapper;
}

/** -------------------------------------------------------------------------
 * createHorizontalRule
 * ------------------------------------------------------------------------- */
function createHorizontalRule(): HTMLHRElement {
    const hr = document.createElement('hr');
    hr.className = 'my-6 border-t border-gray-300';
    return hr;
}

/** -------------------------------------------------------------------------
 * createPageBreak
 * ------------------------------------------------------------------------- */
function createPageBreak(): HTMLDivElement {
    const pageBreak = document.createElement('div');
    pageBreak.className = 'page-break flex items-center justify-center my-8';

    const line = document.createElement('div');
    line.className = 'border-t border-dashed border-gray-300 flex-grow';

    const label = document.createElement('div');
    label.className = 'mx-4 text-xs text-gray-500';
    label.textContent = 'Page Break';

    pageBreak.appendChild(line);
    pageBreak.appendChild(label);
    pageBreak.appendChild(line.cloneNode());

    return pageBreak;
}

/** -------------------------------------------------------------------------
 * createLink
 * ------------------------------------------------------------------------- */
function createLink(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = node.url || '#';
    link.className = 'text-blue-600 hover:underline';
    link.rel = 'noopener noreferrer';
    if (node.newTab || node.target === '_blank') {
        link.target = '_blank';
    }

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                link.appendChild(childElement);
            }
        });
    } else if (node.text) {
        link.textContent = node.text;
    }

    return link;
}

/** -------------------------------------------------------------------------
 * createImage
 * ------------------------------------------------------------------------- */
function createImage(node: LexicalNode): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'my-4';

    const img = document.createElement('img');
    img.src = node.src || '';
    img.alt = node.altText || '';

    // Sizing
    if (node.width) {
        if (typeof node.width === 'number') {
            img.style.width = `${node.width}px`;
        } else {
            img.style.width = node.width;
        }
    }
    if (node.height) {
        if (typeof node.height === 'number') {
            img.style.height = `${node.height}px`;
        } else {
            img.style.height = node.height;
        }
    }

    // Alignment
    if (node.alignment) {
        const alignClass = getAlignmentClass(node.alignment);
        if (alignClass) {
            figure.classList.add(alignClass);
        }

        if (node.alignment === 'center') {
            figure.classList.add('flex', 'justify-center');
        } else if (node.alignment === 'start' || node.alignment === 'left') {
            figure.classList.add('float-left', 'mr-4');
        } else if (node.alignment === 'end' || node.alignment === 'right') {
            figure.classList.add('float-right', 'ml-4');
        }
    }

    figure.appendChild(img);

    // Caption
    if (node.caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.className = 'text-center text-sm text-gray-500 mt-2';
        figcaption.textContent = node.caption;
        figure.appendChild(figcaption);
    }

    return figure;
}

/** -------------------------------------------------------------------------
 * createInlineImage
 *
 * Renders an image node within a figure, optionally with a caption.
 * ------------------------------------------------------------------------- */
function createInlineImage(node: LexicalNode): HTMLElement {
    const figure = document.createElement('figure');
    figure.className = 'my-4';

    const img = document.createElement('img');
    img.src = node.src || '';
    img.alt = node.altText || '';
    img.className = 'max-w-full h-auto rounded';

    // Sizing
    if (node.width && node.width > 0) {
        if (typeof node.width === 'number') {
            img.style.width = `${node.width}px`;
        } else {
            img.style.width = node.width;
        }
    }
    if (node.height && node.height > 0) {
        if (typeof node.height === 'number') {
            img.style.height = `${node.height}px`;
        } else {
            img.style.height = node.height;
        }
    }

    figure.appendChild(img);

    // Add caption if present and showCaption is true
    if (node.showCaption && node.caption && typeof node.caption === 'object') {
        // In some Lexical setups, node.caption might hold an editorState
        // For brevity, just handle as needed in your code.
    } else if (
        node.showCaption &&
        node.caption &&
        typeof node.caption === 'string'
    ) {
        const figcaption = document.createElement('figcaption');
        figcaption.className = 'text-center text-sm text-gray-500 mt-2';
        figcaption.textContent = node.caption;
        figure.appendChild(figcaption);
    }

    return figure;
}

/** -------------------------------------------------------------------------
 * createEmbedElement
 *
 * Renders an embedded widget (Twitter, YouTube, Figma, etc.)
 * ------------------------------------------------------------------------- */
function createEmbedElement(node: LexicalNode, type: string): HTMLDivElement {
    const embed = document.createElement('div');
    embed.className = 'my-4 p-4 border rounded bg-gray-50';

    const embedTitle = document.createElement('div');
    embedTitle.className = 'font-medium mb-2';

    switch (type) {
        case 'twitter':
            embedTitle.textContent = 'Twitter Embed';
            break;
        case 'youtube':
            embedTitle.textContent = 'YouTube Video';
            break;
        case 'figma':
            embedTitle.textContent = 'Figma Design';
            break;
        default:
            embedTitle.textContent = 'Embedded Content';
    }

    embed.appendChild(embedTitle);

    const content = document.createElement('div');
    content.className = 'text-sm text-gray-600';

    if (type === 'twitter' && node.tweetId) {
        content.textContent = `Tweet ID: ${node.tweetId}`;
    } else if (type === 'youtube' && node.videoId) {
        content.textContent = `YouTube Video ID: ${node.videoId}`;
    } else if (type === 'figma' && node.figmaUrl) {
        content.textContent = `Figma URL: ${node.figmaUrl}`;
    } else if (node.url) {
        content.textContent = node.url;
    } else {
        content.textContent = 'Embedded content (rendered dynamically)';
    }

    embed.appendChild(content);
    return embed;
}

/** -------------------------------------------------------------------------
 * createTable
 * ------------------------------------------------------------------------- */
function createTable(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLTableElement {
    const table = document.createElement('table');
    table.className = 'w-full border-collapse table-auto my-4';

    // Column widths
    if (node.colWidths && Array.isArray(node.colWidths)) {
        const colgroup = document.createElement('colgroup');
        node.colWidths.forEach((width) => {
            const col = document.createElement('col');
            col.style.width = `${width}px`;
            colgroup.appendChild(col);
        });
        table.appendChild(colgroup);
    }

    if (node.children) {
        // Check if we have header rows
        const hasHeaderRows = node.children.some(
            (row) =>
                row.children &&
                row.children.some(
                    (cell) => cell.headerState === 1 || cell.headerState === 3,
                ),
        );

        if (hasHeaderRows) {
            const thead = document.createElement('thead');
            thead.className = 'bg-gray-50';
            const tbody = document.createElement('tbody');

            node.children.forEach((rowNode) => {
                const rowElement = processNode(rowNode, headings);
                if (!rowElement) {
                    return;
                }
                // is header row if any cell has headerState 1 or 3
                const isHeaderRow =
                    rowNode.children &&
                    rowNode.children.some(
                        (cell) =>
                            cell.headerState === 1 || cell.headerState === 3,
                    );
                if (isHeaderRow) {
                    thead.appendChild(rowElement);
                } else {
                    tbody.appendChild(rowElement);
                }
            });

            if (thead.children.length > 0) {
                table.appendChild(thead);
            }
            if (tbody.children.length > 0) {
                table.appendChild(tbody);
            }
        } else {
            node.children.forEach((childNode) => {
                const childElement = processNode(childNode, headings);
                if (childElement) {
                    table.appendChild(childElement);
                }
            });
        }
    }

    return table;
}

/** -------------------------------------------------------------------------
 * createTableRow
 * ------------------------------------------------------------------------- */
function createTableRow(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLTableRowElement {
    const row = document.createElement('tr');

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                row.appendChild(childElement);
            }
        });
    }

    return row;
}

/** -------------------------------------------------------------------------
 * createTableCell
 * ------------------------------------------------------------------------- */
function createTableCell(node: LexicalNode): HTMLTableCellElement {
    const headerState = node.headerState ?? 0;
    const isHeader =
        headerState === 1 || headerState === 3 || node.header || node.isHeader;

    const cell = document.createElement(isHeader ? 'th' : 'td');

    // Basic styling
    if (headerState === 1) {
        cell.className = 'border px-4 py-2 bg-gray-100 font-medium text-center';
    } else if (headerState === 2) {
        cell.className = 'border px-4 py-2 bg-gray-50 font-medium text-left';
    } else if (headerState === 3) {
        cell.className = 'border px-4 py-2 bg-gray-200 font-bold text-center';
    } else {
        cell.className = 'border px-4 py-2';
    }

    if (node.colSpan && node.colSpan > 1) {
        cell.colSpan = node.colSpan;
    }
    if (node.rowSpan && node.rowSpan > 1) {
        cell.rowSpan = node.rowSpan;
    }

    if (node.backgroundColor) {
        cell.style.backgroundColor = node.backgroundColor;
    }

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, []);
            if (childElement) {
                cell.appendChild(childElement);
            }
        });
    }

    return cell;
}

/** -------------------------------------------------------------------------
 * createCollapsible
 * ------------------------------------------------------------------------- */
function createCollapsible(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLDetailsElement {
    const collapsible = document.createElement('details');
    collapsible.className = 'border rounded-lg shadow-sm my-4 overflow-hidden';

    if (typeof node.open !== 'undefined') {
        collapsible.open = node.open;
    }

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                collapsible.appendChild(childElement);
            }
        });
    }

    return collapsible;
}

/** -------------------------------------------------------------------------
 * createCollapsibleTitle
 * ------------------------------------------------------------------------- */
function createCollapsibleTitle(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLElement {
    const title = document.createElement('summary');
    title.className =
        'px-4 py-3 cursor-pointer font-medium flex items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-150';

    // A simple style to hide the default marker in Chrome
    const style = document.createElement('style');
    style.textContent = `
    summary::-webkit-details-marker {
      display: none;
    }
  `;
    document.head.appendChild(style);

    const arrow = document.createElement('div');
    arrow.className = 'mr-2 transition-transform duration-200';
    arrow.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex-1';

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                contentWrapper.appendChild(childElement);
            }
        });
    } else if (node.text) {
        contentWrapper.textContent = node.text;
    }

    title.addEventListener('click', () => {
        const details = title.parentElement as HTMLDetailsElement | null;
        if (details) {
            if (details.open) {
                arrow.style.transform = 'rotate(0deg)';
            } else {
                arrow.style.transform = 'rotate(180deg)';
            }
        }
    });

    title.appendChild(arrow);
    title.appendChild(contentWrapper);

    return title;
}

/** -------------------------------------------------------------------------
 * createCollapsibleContent
 * ------------------------------------------------------------------------- */
function createCollapsibleContent(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLDivElement {
    const content = document.createElement('div');
    content.className = 'p-4 border-t bg-white';

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                content.appendChild(childElement);
            }
        });
    }

    return content;
}

/** -------------------------------------------------------------------------
 * createExcalidraw
 *
 * Renders a minimal preview of an Excalidraw diagram if node.data is valid JSON.
 * ------------------------------------------------------------------------- */
function createExcalidraw(node: LexicalNode): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'excalidraw-container border rounded my-4 p-4';

    try {
        const excalidrawData = JSON.parse(node.data);
        if (!excalidrawData.elements || excalidrawData.elements.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'text-center text-gray-500 py-4';
            placeholder.textContent = 'Empty drawing';
            container.appendChild(placeholder);
            return container;
        }

        // Compute bounding box
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        excalidrawData.elements.forEach((el: any) => {
            if (el.isDeleted) {
                return;
            }
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
        });

        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const width = maxX - minX;
        const height = maxY - minY;

        const bgColor = excalidrawData.appState?.viewBackgroundColor || '#fff';
        const ratio = height / width;

        container.innerHTML = `
      <div style="width:100%; max-width:600px; margin:0 auto; position:relative;">
        <div style="padding-bottom:${Math.min(Math.max(ratio, 0.5), 1.5) * 100}%;">
          <svg
            width="100%"
            height="100%"
            viewBox="${minX} ${minY} ${width} ${height}"
            style="position:absolute; top:0; left:0; background:${bgColor}"
          >
            ${excalidrawData.elements
                .map((el: any) => {
                    if (el.isDeleted) {
                        return '';
                    }
                    if (el.type === 'ellipse') {
                        return `
                    <ellipse
                      cx="${el.x + el.width / 2}"
                      cy="${el.y + el.height / 2}"
                      rx="${el.width / 2}"
                      ry="${el.height / 2}"
                      stroke="${el.strokeColor}"
                      stroke-width="${el.strokeWidth}"
                      fill="${
                          el.backgroundColor !== 'transparent'
                              ? el.backgroundColor
                              : 'transparent'
                      }"
                      ${
                          el.strokeStyle === 'dashed'
                              ? 'stroke-dasharray="8 4"'
                              : ''
                      }
                      ${
                          el.strokeStyle === 'dotted'
                              ? 'stroke-dasharray="2 2"'
                              : ''
                      }
                      ${el.opacity < 100 ? `opacity="${el.opacity / 100}"` : ''}
                    />
                  `;
                    } else if (el.type === 'rectangle') {
                        const rotation = el.angle
                            ? `rotate(${(el.angle * 180) / Math.PI}, ${
                                  el.x + el.width / 2
                              }, ${el.y + el.height / 2})`
                            : '';
                        return `
                    <rect
                      x="${el.x}"
                      y="${el.y}"
                      width="${el.width}"
                      height="${el.height}"
                      stroke="${el.strokeColor}"
                      stroke-width="${el.strokeWidth}"
                      fill="${
                          el.backgroundColor !== 'transparent'
                              ? el.backgroundColor
                              : 'transparent'
                      }"
                      ${
                          el.strokeStyle === 'dashed'
                              ? 'stroke-dasharray="8 4"'
                              : ''
                      }
                      ${
                          el.strokeStyle === 'dotted'
                              ? 'stroke-dasharray="2 2"'
                              : ''
                      }
                      ${el.opacity < 100 ? `opacity="${el.opacity / 100}"` : ''}
                      ${rotation ? `transform="${rotation}"` : ''}
                    />
                  `;
                    } else {
                        // fallback
                        return `
                    <rect
                      x="${el.x}"
                      y="${el.y}"
                      width="${el.width}"
                      height="${el.height}"
                      stroke="#888"
                      stroke-width="1"
                      fill="transparent"
                      stroke-dasharray="4 4"
                    />
                  `;
                    }
                })
                .join('')}
          </svg>
        </div>
      </div>
    `;
    } catch (error) {
        console.error('Error rendering excalidraw:', error);
        container.innerHTML = `
      <div class="bg-red-50 p-4 text-red-700 rounded">
        Error rendering drawing
      </div>
    `;
    }

    return container;
}

/** -------------------------------------------------------------------------
 * createPoll
 * ------------------------------------------------------------------------- */
function createPoll(node: LexicalNode): HTMLDivElement {
    const poll = document.createElement('div');
    poll.className = 'poll-container border rounded my-4 p-4';

    // Question
    if (node.question) {
        const title = document.createElement('h3');
        title.className = 'font-medium mb-3';
        title.textContent = node.question;
        poll.appendChild(title);
    }

    // Render options
    if (node.options && Array.isArray(node.options)) {
        const form = document.createElement('form');
        form.className = 'space-y-2';

        node.options.forEach((option, index) => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 cursor-pointer';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'poll-option';
            radio.value = option.uid || `option-${index}`;
            radio.className = 'poll-option-radio';

            const labelText = document.createElement('span');
            labelText.textContent = option.text || `Option ${index + 1}`;

            label.appendChild(radio);
            label.appendChild(labelText);
            form.appendChild(label);
        });

        const voteButton = document.createElement('button');
        voteButton.type = 'submit';
        voteButton.className =
            'px-3 py-1.5 border rounded bg-blue-500 text-white';
        voteButton.textContent = 'Vote';

        form.appendChild(voteButton);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const selected = form.querySelector(
                'input[name="poll-option"]:checked',
            ) as HTMLInputElement | null;
            if (selected) {
                alert(`You voted for: ${selected.value}`);
            } else {
                alert('Please select an option before voting.');
            }
        });

        poll.appendChild(form);
    }

    return poll;
}

/** -------------------------------------------------------------------------
 * createColumnsLayout
 * ------------------------------------------------------------------------- */
function createColumnsLayout(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLDivElement {
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'grid gap-4 my-4';

    if (node.templateColumns) {
        columnsContainer.style.gridTemplateColumns = node.templateColumns;
    } else {
        const columnsCount =
            node.columns || (node.children ? node.children.length : 2);
        // Just clamp to 12 columns max if using Tailwind
        const safeCount = Math.min(columnsCount, 12);
        // Because "grid-cols-N" is a standard tailwind class only for N up to 12
        columnsContainer.classList.add(`grid-cols-${safeCount}`);
    }

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                columnsContainer.appendChild(childElement);
            }
        });
    }

    return columnsContainer;
}

/** -------------------------------------------------------------------------
 * createColumn
 * ------------------------------------------------------------------------- */
function createColumn(
    node: LexicalNode,
    headings: HeadingData[],
): HTMLDivElement {
    const column = document.createElement('div');
    column.className = 'column p-2 border rounded';

    if (node.children) {
        node.children.forEach((childNode) => {
            const childElement = processNode(childNode, headings);
            if (childElement) {
                column.appendChild(childElement);
            }
        });
    }

    return column;
}

/** -------------------------------------------------------------------------
 * createEquation
 * ------------------------------------------------------------------------- */
function createEquation(node: LexicalNode): HTMLDivElement {
    const equation = document.createElement('div');
    equation.className = 'equation my-2 text-center';

    if (node.equation) {
        equation.textContent = node.equation;
    } else if (node.latex) {
        equation.textContent = node.latex;
    } else if (node.children && node.children[0] && node.children[0].text) {
        equation.textContent = node.children[0].text;
    } else {
        equation.textContent = '[Equation]';
    }

    return equation;
}

/** -------------------------------------------------------------------------
 * createEmoji
 * ------------------------------------------------------------------------- */
function createEmoji(node: LexicalNode): HTMLSpanElement {
    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = node.emoji || node.text || '😀';
    return emoji;
}

/** -------------------------------------------------------------------------
 * createHashtag
 * ------------------------------------------------------------------------- */
function createHashtag(node: LexicalNode): HTMLSpanElement {
    const hashtag = document.createElement('span');
    hashtag.className = 'hashtag text-blue-600';
    hashtag.textContent = node.hashtag || node.text || '#hashtag';
    return hashtag;
}

/** -------------------------------------------------------------------------
 * createMention
 * ------------------------------------------------------------------------- */
function createMention(node: LexicalNode): HTMLSpanElement {
    // The text for display in the inline mention (e.g., "@Leanne Graham")
    const displayText = node.trigger ? node.trigger + node.value : node.value;
    const userId = node.data?.id ?? 'N/A';
    const avatarUrl = node.data?.avatarUrl ?? 'https://placehold.co/400';
    const userBio =
        node.data?.bio ??
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    const mentionWrapper = document.createElement('span');
    mentionWrapper.className =
        'mention bg-blue-100 text-blue-800 px-1 rounded cursor-pointer relative';
    mentionWrapper.textContent = displayText || '@unknown';

    // Hidden card
    const card = document.createElement('div');
    card.className =
        'hidden absolute w-64 top-full left-0 mt-1 p-3 bg-white border rounded shadow text-sm z-10';

    // Card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'flex items-center gap-2 mb-2';

    const avatarImg = document.createElement('img');
    avatarImg.src = avatarUrl;
    avatarImg.alt = displayText || 'User';
    avatarImg.className = 'w-12 h-12 rounded-full object-cover';

    const nameAndBioWrapper = document.createElement('div');
    const nameEl = document.createElement('div');
    nameEl.className = 'font-semibold';
    nameEl.textContent = node.value || 'Unknown User';

    const bioEl = document.createElement('div');
    bioEl.className = 'text-xs text-gray-600';
    bioEl.textContent = userBio;

    nameAndBioWrapper.appendChild(nameEl);
    nameAndBioWrapper.appendChild(bioEl);

    cardHeader.appendChild(avatarImg);
    cardHeader.appendChild(nameAndBioWrapper);

    // Card bottom buttons
    const buttonRow = document.createElement('div');
    buttonRow.className = 'flex gap-2';

    const profileButton = document.createElement('button');
    profileButton.className =
        'bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors';
    profileButton.textContent = 'View Profile';

    const chatButton = document.createElement('button');
    chatButton.className =
        'bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors';
    chatButton.textContent = 'Chat';

    buttonRow.appendChild(profileButton);
    buttonRow.appendChild(chatButton);

    card.appendChild(cardHeader);
    card.appendChild(buttonRow);

    mentionWrapper.appendChild(card);

    // Show/hide card on hover
    mentionWrapper.addEventListener('mouseenter', () => {
        card.classList.remove('hidden');
    });
    mentionWrapper.addEventListener('mouseleave', () => {
        card.classList.add('hidden');
    });

    return mentionWrapper;
}

/** -------------------------------------------------------------------------
 * applyStyleToElement
 *
 * Apply a CSS style string (e.g. "color: red; font-size: 16px")
 * to the element, using Tailwind classes if possible.
 * ------------------------------------------------------------------------- */
function applyStyleToElement(element: HTMLElement, styleString: string): void {
    if (!styleString) {
        return;
    }

    const styles = styleString.split(';').filter(Boolean);

    styles.forEach((style) => {
        const [property, value] = style.split(':').map((s) => s.trim());
        if (property && value) {
            switch (property) {
                case 'color': {
                    const colorClass = mapColorToTailwind(value);
                    if (colorClass) {
                        element.classList.add(colorClass);
                    } else {
                        element.style.color = value;
                    }
                    break;
                }
                case 'background-color': {
                    const bgClass = mapBgColorToTailwind(value);
                    if (bgClass) {
                        element.classList.add(bgClass);
                    } else {
                        element.style.backgroundColor = value;
                    }
                    break;
                }
                case 'font-size': {
                    const sizeClass = mapFontSizeToTailwind(value);
                    if (sizeClass) {
                        element.classList.add(sizeClass);
                    } else {
                        element.style.fontSize = value;
                    }
                    break;
                }
                case 'text-align': {
                    const alignClass = getAlignmentClass(value);
                    if (alignClass) {
                        element.classList.add(alignClass);
                    } else {
                        element.style.textAlign = value;
                    }
                    break;
                }
                default:
                    // Fallback to inline
                    (element.style as any)[property] = value;
            }
        }
    });
}

/** -------------------------------------------------------------------------
 * mapColorToTailwind
 * ------------------------------------------------------------------------- */
function mapColorToTailwind(color: string): string | null {
    const colorMap: Record<string, string> = {
        'rgb(0, 0, 0)': 'text-black',
        black: 'text-black',
        'rgb(255, 255, 255)': 'text-white',
        white: 'text-white',
        'rgb(239, 68, 68)': 'text-red-500',
        red: 'text-red-500',
        'rgb(34, 197, 94)': 'text-green-500',
        green: 'text-green-500',
        'rgb(59, 130, 246)': 'text-blue-500',
        blue: 'text-blue-500',
        'rgb(245, 158, 11)': 'text-amber-500',
        orange: 'text-orange-500',
        'rgb(139, 92, 246)': 'text-purple-500',
        purple: 'text-purple-500',
        'rgb(236, 72, 153)': 'text-pink-500',
        pink: 'text-pink-500',
        'rgb(107, 114, 128)': 'text-gray-500',
        gray: 'text-gray-500',
    };

    return colorMap[color] || null;
}

/** -------------------------------------------------------------------------
 * mapBgColorToTailwind
 * ------------------------------------------------------------------------- */
function mapBgColorToTailwind(color: string): string | null {
    const bgColorMap: Record<string, string> = {
        'rgb(0, 0, 0)': 'bg-black',
        black: 'bg-black',
        'rgb(255, 255, 255)': 'bg-white',
        white: 'bg-white',
        'rgb(239, 68, 68)': 'bg-red-500',
        red: 'bg-red-500',
        'rgb(34, 197, 94)': 'bg-green-500',
        green: 'bg-green-500',
        'rgb(59, 130, 246)': 'bg-blue-500',
        blue: 'bg-blue-500',
        'rgb(245, 158, 11)': 'bg-amber-500',
        orange: 'bg-orange-500',
        'rgb(139, 92, 246)': 'bg-purple-500',
        purple: 'bg-purple-500',
        'rgb(236, 72, 153)': 'bg-pink-500',
        pink: 'bg-pink-500',
        'rgb(107, 114, 128)': 'bg-gray-500',
        gray: 'bg-gray-500',
    };

    return bgColorMap[color] || null;
}

/** -------------------------------------------------------------------------
 * mapFontSizeToTailwind
 * ------------------------------------------------------------------------- */
function mapFontSizeToTailwind(fontSize: string): string | null {
    const fontSizeMap: Record<string, string> = {
        '12px': 'text-xs',
        '14px': 'text-sm',
        '16px': 'text-base',
        '18px': 'text-lg',
        '20px': 'text-xl',
        '24px': 'text-2xl',
        '30px': 'text-3xl',
        '36px': 'text-4xl',
        '48px': 'text-5xl',
        '60px': 'text-6xl',
    };

    return fontSizeMap[fontSize] || null;
}

/** -------------------------------------------------------------------------
 * getAlignmentClass
 *
 * Return the appropriate Tailwind text alignment class for a given alignment
 * value (like "left", "right", "center", "justify").
 * ------------------------------------------------------------------------- */
function getAlignmentClass(alignment: string): string | null {
    if (!alignment) {
        return null;
    }
    const val = alignment.toLowerCase();
    switch (val) {
        case 'left':
        case 'start':
            return 'text-left';
        case 'center':
        case 'middle':
            return 'text-center';
        case 'right':
        case 'end':
            return 'text-right';
        case 'justify':
            return 'text-justify';
        default:
            return null;
    }
}

/** -------------------------------------------------------------------------
 * createUniqueHeadingId
 *
 * Creates a slug-like ID from heading text. If the text is missing or short,
 * returns a random ID.
 * ------------------------------------------------------------------------- */
function createUniqueHeadingId(text: string): string {
    const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove non-alphanumerics
        .replace(/\s+/g, '-') // spaces to hyphens
        .trim();

    const randomSuffix = Math.random().toString(36).substring(2, 8);

    if (!slug || slug.length < 2) {
        return `heading-${randomSuffix}`;
    }

    // Limit length to ~50 chars
    const trimmed = slug.slice(0, 50).replace(/-+$/, '');
    return `${trimmed}-${randomSuffix}`;
}

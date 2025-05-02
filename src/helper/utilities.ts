import React from 'react';
import { toast } from 'sonner';
import { marked } from 'marked';
import parse from 'html-react-parser';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';

interface MessageData {
    message?: {
        text?: string;
        sender?: {
            fullName?: string;
        };
    };
    chat?: {
        name?: string;
        isChannel?: boolean;
    };
}

interface NotificationResult {
    isSent: boolean;
}

function htmlToStr(text?: string): string {
    return text?.replace(/<[^>]*>?/gm, '') || '';
}

function notiMentionParser(
    fullMatch: string,
    original: string,
    trigger: string,
    name: string,
    id: string,
): string {
    return `@${name}`;
}

// const mentionRegEx = /((.)\[([^[]*)]$$([^(^)]*)$$)/gi;
const mentionRegEx = /@\[.*?\]\((.*?)\)/g;

function editReplacer(
    fullMatch: string,
    original: string,
    trigger: string,
    name: string,
    id: string,
): string {
    return `<span class="mention" data-index="${id}" data-denotation-char="@" data-id="${id}" data-value="${name}">
    <span contenteditable="false">
    <span class="ql-mention-denotation-char">@</span>
    ${name}</span>
    </span>`;
}

export const getText = (html?: string): string => {
    if (!html) {
        return '';
    }

    const divContainer = document.createElement('div');
    divContainer.innerHTML = html;
    return divContainer.textContent || divContainer.innerText || '';
};

export const parseMentionToEdit = (string: string): string => {
    return string.replace(mentionRegEx, editReplacer);
};

export const replaceNodeToMention = (string: string): string => {
    const div = document.createElement('div');
    div.innerHTML = string;

    for (const node of div.querySelectorAll('.mention')) {
        const element = node as HTMLElement;
        const dataValue = element.getAttribute('data-value') || '';
        const dataId = element.getAttribute('data-id') || '';

        element.outerHTML = `@[${dataValue}](${dataId})`;
    }

    return div.innerHTML;
};

function replacerMessage(
    fullMatch: string,
    original: string,
    trigger: string,
    name: string,
    id: string,
): string {
    if (trigger.startsWith('<')) {
        return `
      <span class="mention" data-id="${id}" data-value="${name}">
        ${trigger} ${name}
      </span>
    `;
    } else {
        return `
      <span class="mention" data-id="${id}" data-value="${name}">
        ${trigger}${name}
      </span>
    `;
    }
}

export const replaceMentionToNode = (string?: string): string => {
    if (!string) {
        return '';
    }
    return string.replace(mentionRegEx, replacerMessage);
};

// export const parseMentionFromPlainString = (plainMessage: string): void => {
//     plainMessage.replace(mentionRegEx, notiMentionParser) || 'N/A';
// };

function convertMarkdownToHtml(markdownText?: string): string {
    if (!markdownText) {
        return '';
    }

    // Use marked to parse the markdown text
    const result = marked(markdownText);
    return result instanceof Promise ? '' : result;
}

// interface CustomNotificationContentProps {
//     el: string;
// }

// const CustomNotificationContent: React.FC<CustomNotificationContentProps> = ({ el }) =>
//   {
// return <div className="message-notification">{parse(el)}</div>

// }
export const handleMessageNoti = (
    data: MessageData,
    userId: string,
): NotificationResult => {
    const plainMessage = htmlToStr(data?.message?.text);
    if (!plainMessage) {
        return { isSent: false };
    }

    const message =
        plainMessage.replace(mentionRegEx, notiMentionParser) || 'N/A';
    const sender = data?.message?.sender?.fullName;
    const mentions = plainMessage.match(mentionRegEx);
    console.log({ mentions });
    if (data?.chat?.isChannel) {
        if (mentions && mentions.length > 0) {
            const ids = mentions.map((s) => {
                // Extract ID from the format "@[name](id)"
                const matches = s.match(/\(([^)]+)\)/);

                if (!matches || matches.length < 2) {
                    return '';
                }
                // matches[1] contains just the ID part without parentheses
                return matches[1];
            });
            console.log({ ids });
            if (ids && ids.includes('everyone')) {
                toast.success(
                    `${sender || 'Someone'} mentioned you and everyone in ${data?.chat?.name}`,
                    {
                        description: renderPlainText({
                            text: message,
                            lineClamp: 1,
                        }),
                        duration: 5000,
                    },
                );
                return { isSent: true };
            } else if (ids.includes(userId)) {
                console.log({ userId });
                toast.success(
                    `${sender || 'Someone'} mentioned you in ${data?.chat?.name}`,
                    {
                        description: renderPlainText({
                            text: message,
                            lineClamp: 1,
                        }),
                        duration: 5000,
                    },
                );
                return { isSent: true };
            }
            return { isSent: false };
        } else {
            return { isSent: false };
        }
    } else {
        toast.success(sender || 'New Message', {
            description: renderPlainText({ text: message, lineClamp: 1 }),
            duration: 5000,
        });
        return { isSent: true };
    }
};

export const downloadFileWithLink = (href?: string): void => {
    if (!href) {
        toast.error('Invalid URL', {
            description: 'The download link is not valid or missing.',
        });
        return;
    }

    const link = document.createElement('a');
    const parts = href.split('/') || [];
    const name = parts[parts.length - 1];

    link.setAttribute('download', name);
    link.href = href.startsWith('https://') ? href : 'https://' + href;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

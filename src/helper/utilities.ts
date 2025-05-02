import React from 'react';
import { toast } from 'sonner';
import { marked } from 'marked';
import parse from 'html-react-parser';
import { renderPlainText } from '@/components/lexicalEditor/renderer/renderPlainText';
import { store } from '@/redux/store';

interface MessageData {
    message?: {
        text?: string;
        sender?: {
            fullName?: string;
        };
        chat?: any;
        files?: any;
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
    isNotificationOn?: boolean,
): NotificationResult => {
    const plainMessage = htmlToStr(data?.message?.text);
    const selectedChat = store.getState()?.chat?.selectedChat;

    // Don't show toast if notifications are disabled for this chat or if it's the selected chat
    if (
        isNotificationOn === false ||
        (selectedChat && selectedChat._id === data.message?.chat)
    ) {
        return { isSent: false };
    }

    // Check if the message contains files
    const hasFiles = data?.message?.files && data.message.files.length > 0;

    // For non-channel chats, show notification for both text and file messages
    if (!data?.chat?.isChannel) {
        const sender = data?.message?.sender?.fullName;

        // Create appropriate message based on content
        if (hasFiles) {
            // File notification with specific file type information
            const files = data?.message?.files || [];

            // Count occurrences of each file type
            const fileTypes = {
                image: files.filter((file: any) =>
                    file.type?.includes('image/'),
                ).length,
                video: files.filter((file: any) =>
                    file.type?.includes('video/'),
                ).length,
                audio: files.filter((file: any) =>
                    file.type?.includes('audio/'),
                ).length,
                other: files.filter(
                    (file: any) =>
                        !file.type?.includes('image/') &&
                        !file.type?.includes('video/') &&
                        !file.type?.includes('audio/'),
                ).length,
            };

            let notificationText = '';

            // Create descriptive message based on file types
            if (files.length === 1) {
                // Single file - be specific about type
                if (fileTypes.image === 1) {
                    notificationText = 'Sent you an image';
                } else if (fileTypes.video === 1) {
                    notificationText = 'Sent you a video';
                } else if (fileTypes.audio === 1) {
                    notificationText = 'Sent you an audio file';
                } else {
                    notificationText = 'Sent you a file';
                }
            } else {
                // Multiple files - describe the mix
                const fileDescriptions = [];

                if (fileTypes.image > 0) {
                    fileDescriptions.push(
                        `${fileTypes.image} ${fileTypes.image === 1 ? 'image' : 'images'}`,
                    );
                }
                if (fileTypes.video > 0) {
                    fileDescriptions.push(
                        `${fileTypes.video} ${fileTypes.video === 1 ? 'video' : 'videos'}`,
                    );
                }
                if (fileTypes.audio > 0) {
                    fileDescriptions.push(
                        `${fileTypes.audio} ${fileTypes.audio === 1 ? 'audio file' : 'audio files'}`,
                    );
                }
                if (fileTypes.other > 0) {
                    fileDescriptions.push(
                        `${fileTypes.other} ${fileTypes.other === 1 ? 'file' : 'files'}`,
                    );
                }

                // Join with commas and "and"
                if (fileDescriptions.length === 1) {
                    notificationText = `Sent you ${fileDescriptions[0]}`;
                } else if (fileDescriptions.length === 2) {
                    notificationText = `Sent you ${fileDescriptions[0]} and ${fileDescriptions[1]}`;
                } else {
                    const lastDesc = fileDescriptions.pop();
                    notificationText = `Sent you ${fileDescriptions.join(', ')}, and ${lastDesc}`;
                }
            }

            // If there's also a message, mention it
            if (plainMessage) {
                toast.success(sender || 'New Message', {
                    description: renderPlainText({
                        text: plainMessage,
                        lineClamp: 1,
                    }),
                    duration: 5000,
                });
            } else {
                toast.success(sender || 'New Message', {
                    description: notificationText,
                    duration: 5000,
                });
            }

            return { isSent: true };
        } else if (plainMessage) {
            // Text-only message
            toast.success(sender || 'New Message', {
                description: renderPlainText({
                    text: plainMessage,
                    lineClamp: 1,
                }),
                duration: 5000,
            });
            return { isSent: true };
        } else {
            // Fallback for empty messages (shouldn't happen)
            toast.success(sender || 'New Message', {
                description: 'Sent you a message',
                duration: 5000,
            });
            return { isSent: true };
        }
    }

    // Rest of the function for channel messages remains mostly the same
    // Channel message handling
    if (!plainMessage && !hasFiles) {
        return { isSent: false };
    }

    const message =
        plainMessage?.replace(mentionRegEx, notiMentionParser) || 'N/A';
    const sender = data?.message?.sender?.fullName;
    const mentions = plainMessage?.match(mentionRegEx);

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

            // Create better attachment description for channel messages
            let attachmentText = '';
            if (hasFiles) {
                const files = data?.message?.files || [];
                if (files.some((file: any) => file.type?.includes('image/'))) {
                    attachmentText = 'Sent an image';
                } else if (
                    files.some((file: any) => file.type?.includes('video/'))
                ) {
                    attachmentText = 'Sent a video';
                } else if (
                    files.some((file: any) => file.type?.includes('audio/'))
                ) {
                    attachmentText = 'Sent an audio file';
                } else {
                    attachmentText = 'Sent an attachment';
                }
            }

            if (ids && ids.includes('everyone')) {
                toast.success(
                    `${sender || 'Someone'} mentioned you and everyone in ${data?.chat?.name}`,
                    {
                        description: renderPlainText({
                            text: plainMessage || attachmentText,
                            lineClamp: 1,
                        }),
                        duration: 5000,
                    },
                );
                return { isSent: true };
            } else if (ids.includes(userId)) {
                toast.success(
                    `${sender || 'Someone'} mentioned you in ${data?.chat?.name}`,
                    {
                        description: renderPlainText({
                            text: plainMessage || attachmentText,
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
    }

    // This should never be reached but added for completeness
    return { isSent: false };
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

import dayjs from 'dayjs';
import { toast } from 'sonner';

export const getInitialsFromName = (name: string) => {
    if (!name) {
        return '';
    }

    const words = name.trim().split(/\s+/);
    const initials = words
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
    return initials;
};

export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
        return true; // Success
    } catch (err) {
        console.error('Failed to copy:', err);
        return false; // Failure
    }
};

const mentionRegEx = /((.)\[([^[]*)]\(([^(^)]*)\))/gi;
function editReplacer(name: string, id: string) {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    const result = `<span class="mention" data-index="${id}" data-denotation-char="@" data-id="${id}" data-value="${name}">
    <span contenteditable="false">
    <span class="ql-mention-denotation-char">@</span>
    ${name}</span>
    </span>`;

    return result;
}

export const parseMentionToEdit = (string: string) => {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    const result = string.replace(mentionRegEx, editReplacer);
    return result;
};

function replacerMessage(trigger: string, name: string, id: string) {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    const result = `
  <span class="mention"  data-id="${id}" data-value="${name}">
  ${trigger}${name}
  </span>
  `;

    return result;
}

export const replaceMentionToNode = (string: string) => {
    const result = string?.replace(mentionRegEx, replacerMessage);
    return result;
};

export const replaceNodeToMention = (string: string) => {
    const div = document.createElement('div');
    div.innerHTML = string;
    for (const node of div.querySelectorAll('.mention')) {
        node.outerHTML = `@[${node.getAttribute('data-value')}](${node.getAttribute('data-id')})`;
    }

    console.log(div.innerHTML);
    return div.innerHTML;
};

export function transformMessage(text: string) {
    return text?.replace(
        // eslint-disable-next-line no-useless-escape
        /@\[([^\]]+)\]\([^\)]+\)/g,
        '<span style="background-color: #00800024;color:#008000f0;font-weight:bold">@$1</span>',
    );
}

export const transFormDate = (text: string) => {
    const regexPattern = /\{\{DATE:(.*?)\}\}/g;
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return text?.replace(regexPattern, (match, startTime) => {
        return `${dayjs(startTime).format('MMMM Do YYYY, h:mm A z')} (${userTimezone})`;
    });
};

export const isValidObjectId = (id: string) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

/**
 * Format a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const formatTimeAgo = (dateString: string | Date): string => {
    if (!dateString) {
        return '';
    }

    const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString;

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
        return 'just now';
    }

    // Less than an hour
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than a day
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than a week
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Less than a month
    if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Less than a year
    if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    // More than a year
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

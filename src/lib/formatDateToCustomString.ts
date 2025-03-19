import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDateToCustomString(
    dateString: string | undefined,
    isFull: boolean = true,
): string {
    const date = dayjs.utc(dateString).local();

    if (!dateString) {
        return 'Dec 16, 1971 | 12:00 AM';
    }

    if (isFull) {
        return date.format('MMM D, YYYY | h:mm A');
    }

    return date.format('MMM D, YYYY');
}

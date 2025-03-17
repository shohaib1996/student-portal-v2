import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDateToCustomString(
    dateString: string | undefined,
): string {
    const date = dayjs.utc(dateString).local();

    if (!dateString) {
        return 'Dec 16, 1971 | 12:00 AM';
    }

    return date.format('MMM D, YYYY | h:mm A');
}

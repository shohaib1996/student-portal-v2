import { useState, useEffect } from 'react';

const FormattingTime = ({ createdAt }: { createdAt: string }) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const getRelativeTime = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor(
                (now.getTime() - date.getTime()) / 1000,
            );

            const intervals: { [key: string]: number } = {
                year: 31536000,
                month: 2592000,
                week: 604800,
                day: 86400,
                hour: 3600,
                minute: 60,
                second: 1,
            };

            for (const key in intervals) {
                const interval = intervals[key];
                const timeDifference = Math.floor(diffInSeconds / interval);

                if (timeDifference >= 1) {
                    return `${timeDifference} ${key}${timeDifference > 1 ? 's' : ''} ago`;
                }
            }

            return 'Just now';
        };

        setTimeAgo(getRelativeTime(createdAt));
    }, [createdAt]);

    return <span className='text-xs text-gray'>{timeAgo}</span>;
};

export default FormattingTime;

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import React from 'react';
dayjs.extend(utc);
dayjs.extend(timezone);

const TdDate = ({
    date,
    timeZone,
}: {
    date?: Date | Dayjs | string;
    timeZone?: string;
}) => {
    return (
        <div>
            <h2 className='text-sm text-black'>
                {dayjs(date).format('MMM D, YYYY')}
            </h2>
            <p className='text-xs text-dark-gray'>
                {dayjs(date).format('h:mm A')}
            </p>
        </div>
    );
};

export default TdDate;

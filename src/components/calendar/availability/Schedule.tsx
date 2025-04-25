'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import timesArray from '../helpers/times';
import { TAvailability, TInterval, TSchedule } from '../types/calendarTypes';
import WeekDay, { TCopyTo } from './WeekDay';
import OverrideModal from './OverrideModal';

type TProps = {
    schedule: TSchedule;
    setAvailability: Dispatch<SetStateAction<TAvailability[]>>;
    availability: TAvailability[];
    name: string;
    setName: Dispatch<SetStateAction<string>>;
};

export default function Schedule({
    schedule,
    setAvailability,
    availability,
    name,
    setName,
}: TProps) {
    const [overrideModal, setOverrideModal] = useState(false);

    useEffect(() => {
        if (schedule) {
            setAvailability(schedule?.availability || []);
            setName(schedule?.name);
        }
    }, [schedule]);

    const handleRemoveOverride = (item: TAvailability) => {
        const array = JSON.parse(JSON.stringify(availability));
        const index = array.findIndex(
            (x: TAvailability) =>
                x.type === 'date' && dayjs(item.date).isSame(x?.date, 'day'),
        );

        array.splice(index, 1);
        setAvailability(array);
    };

    const handleApply = ({
        dates,
        intervals,
    }: {
        dates: Dayjs[];
        intervals: TInterval[];
    }) => {
        if (dates?.length > 0 && intervals?.length > 0) {
            dates?.forEach((date) => {
                setAvailability((prev) => {
                    let array = JSON.parse(JSON.stringify(prev));
                    const index = array
                        ?.filter((x: TAvailability) => x?.type === 'date')
                        .findIndex((x: TAvailability) =>
                            dayjs(date).isSame(x?.date, 'day'),
                        );

                    if (index === -1) {
                        array = [
                            ...array,
                            {
                                type: 'date',
                                intervals: intervals,
                                date: date,
                            },
                        ];
                    } else {
                        array[index] = {
                            ...array[index],
                            intervals,
                        };
                    }

                    return array;
                });
            });
        }

        setOverrideModal(false);
    };

    const updateIntervals = ({
        intervals,
        wday,
    }: {
        intervals: TInterval[];
        wday: string;
    }) => {
        setAvailability((prev) => {
            let array = JSON.parse(JSON.stringify(prev));
            const index = array?.findIndex(
                (x: TAvailability) => x?.wday === wday,
            );

            if (index === -1) {
                array = [
                    ...array,
                    {
                        type: 'wady',
                        intervals: intervals,
                        wday: wday,
                    },
                ];
            } else {
                array[index] = {
                    ...array[index],
                    intervals,
                };
            }

            return array;
        });
    };

    const handleAppyCopyTo = ({
        intervals,
        copyTo,
    }: {
        intervals: TInterval[];
        copyTo: TCopyTo;
    }) => {
        Object.keys(copyTo)?.forEach((key) => {
            if (copyTo[key]) {
                updateIntervals({ intervals, wday: key });
            }
        });
    };

    if (!schedule) {
        return null;
    }

    return (
        <div className=''>
            <div className='grid grid-cols-1 xl:grid-cols-[3fr_2fr] 3xl:grid-cols-[2fr_1fr] 4xl:grid-cols-2 gap-2'>
                <div className='bg-foreground border border-forground-border p-2 rounded-md'>
                    <div className='border-b w-full'>
                        <h2 className='text-lg text-black font-semibold'>
                            7-day schedule
                        </h2>
                    </div>
                    <div className='space-y-2 pt-2'>
                        <div className='space-y-2'>
                            {[
                                'sunday',
                                'monday',
                                'tuesday',
                                'wednesday',
                                'thursday',
                                'friday',
                                'saturday',
                            ].map((day) => (
                                <WeekDay
                                    key={day}
                                    intervals={
                                        availability?.find(
                                            (x) => x.wday === day,
                                        )?.intervals || []
                                    }
                                    title={day.slice(0, 3).toUpperCase()}
                                    updateIntervals={(value) =>
                                        updateIntervals({
                                            intervals: value,
                                            wday: day,
                                        })
                                    }
                                    handleAppyCopyTo={handleAppyCopyTo}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className='bg-foreground border border-forground-border p-2 rounded-md'>
                    <div className='border-b w-full'>
                        <h2 className='text-lg text-black font-semibold'>
                            Date-Specific Hours
                        </h2>
                        <p className='text-sm text-dark-gray'>
                            Adjust availability for specific dates with
                            different hours
                        </p>
                    </div>
                    <div className='pt-2 space-y-2'>
                        <p className='text-sm text-dark-gray'>
                            Override your availability for specific dates when
                            your hours differ from your regular weekly hours.
                        </p>

                        <Button
                            variant='primary_light'
                            className='w-full mb-4'
                            onClick={() => setOverrideModal(true)}
                        >
                            Add Date Specific Hours
                        </Button>

                        <div className='space-y-2'>
                            {availability
                                ?.filter(
                                    (x: TAvailability) => x.type === 'date',
                                )
                                .map((availability: TAvailability, i) => (
                                    <div
                                        key={i}
                                        className='flex items-center gap-4 p-2 bg-background border rounded-md'
                                    >
                                        <div className='flex-grow'>
                                            <p className='font-medium text-dark-gray'>
                                                {dayjs(
                                                    availability?.date,
                                                ).format('MMM DD, YYYY')}
                                            </p>
                                            {availability?.intervals?.map(
                                                (interval, index) => (
                                                    <div
                                                        key={index}
                                                        className='text-sm text-muted-foreground'
                                                    >
                                                        {timesArray?.find(
                                                            (x) =>
                                                                x.value ===
                                                                interval?.from,
                                                        )?.label ||
                                                            interval?.from}
                                                        {' - '}
                                                        {timesArray?.find(
                                                            (x) =>
                                                                x.value ===
                                                                interval?.to,
                                                        )?.label ||
                                                            interval?.to}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <Button
                                            variant='destructive'
                                            size='icon'
                                            onClick={() =>
                                                handleRemoveOverride(
                                                    availability,
                                                )
                                            }
                                        >
                                            <X className='h-4 w-4' />
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            <OverrideModal
                handleApply={handleApply}
                isOpen={overrideModal}
                handleClose={() => setOverrideModal(false)}
            />
        </div>
    );
}

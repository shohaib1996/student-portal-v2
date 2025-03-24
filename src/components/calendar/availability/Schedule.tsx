'use client';

import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { useUpdateScheduleMutation } from '@/redux/api/calendar/calendarApi';
import timesArray from '../../../../public/times';
import {
    TAvailability,
    TInterval,
    TSchedule,
    TUpdateSchedule,
} from '@/types/calendar/calendarTypes';
import WeekDay, { TCopyTo } from './WeekDay';
import OverrideModal from './OverrideModal';

type TProps = {
    schedule: TSchedule;
    handleUpdateList: (schedule: TSchedule) => void;
};

export default function Schedule({ schedule, handleUpdateList }: TProps) {
    const [selectedTimezone, setSelectedTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    );

    const [overrideModal, setOverrideModal] = useState(false);
    const [availability, setAvailability] = useState<TAvailability[]>([]);
    const [name, setName] = useState('');
    const [updateSchedule, { isLoading: savingSchedule }] =
        useUpdateScheduleMutation();

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

    const handleSave = async () => {
        const data: TUpdateSchedule = {
            availability,
            name,
            timeZone: selectedTimezone,
        };

        try {
            const res = await updateSchedule({
                scheduleId: schedule?._id || '',
                payload: data,
            }).unwrap();

            if (res) {
                toast.success('Schedule updated successfully');
            }
        } catch (err) {
            // globalErrorHandler(err)
        }
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
        <div className='container mx-auto p-4'>
            <div className='grid md:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <Input
                                placeholder='Schedule Name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <Select
                                value={selectedTimezone}
                                onValueChange={(value) =>
                                    setSelectedTimezone(value)
                                }
                                disabled
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Timezone' />
                                </SelectTrigger>
                                {/* <SelectContent>
                                    {options.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent> */}
                            </Select>

                            <div className='space-y-4'>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Date-Specific Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-muted-foreground mb-4'>
                            Override your availability for specific dates when
                            your hours differ from your regular weekly hours.
                        </p>

                        <Button
                            variant='secondary'
                            className='w-full mb-4'
                            onClick={() => setOverrideModal(true)}
                        >
                            Add Date Specific Hours
                        </Button>

                        <div className='space-y-4'>
                            {availability
                                ?.filter(
                                    (x: TAvailability) => x.type === 'date',
                                )
                                .map((availability: TAvailability, i) => (
                                    <div
                                        key={i}
                                        className='flex items-center gap-4 p-3 border rounded-md'
                                    >
                                        <div className='flex-grow'>
                                            <p className='font-semibold'>
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
                    </CardContent>
                </Card>
            </div>

            <Button
                className='mt-6 w-full'
                disabled={savingSchedule}
                onClick={handleSave}
            >
                {savingSchedule ? 'Saving...' : 'Save Schedule'}
            </Button>

            <OverrideModal
                handleApply={handleApply}
                isOpen={overrideModal}
                handleClose={() => setOverrideModal(false)}
            />
        </div>
    );
}

'use client';
import AddAvailability from '@/components/calendar/availability/AddAvailability';
import GlobalHeader from '@/components/global/GlobalHeader';
import { Button } from '@/components/ui/button';
import {
    useGetAllSchedulesQuery,
    useUpdateScheduleMutation,
} from '@/components/calendar/api/calendarApi';
import {
    TAvailability,
    TUpdateSchedule,
} from '@/components/calendar/types/calendarTypes';
import { BookmarkCheck, RotateCcw, Undo, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

const AvailabilityPage = () => {
    const [updateSchedule, { isLoading: savingSchedule }] =
        useUpdateScheduleMutation();
    const [selectedTimezone, setSelectedTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    const { data: scheduleData, isLoading } =
        useGetAllSchedulesQuery(undefined);

    const schedules = scheduleData?.schedules || [];
    const [availability, setAvailability] = useState<TAvailability[]>([]);
    const [name, setName] = useState('');

    const handleSave = async () => {
        try {
            const res = await updateSchedule({
                scheduleId: schedules[0]?._id as string,
                payload: {
                    name,
                    availability,
                    timeZone: selectedTimezone,
                },
            }).unwrap();

            if (res) {
                toast.success('Schedule updated successfully');
            }
        } catch (err) {
            // globalErrorHandler(err)
        }
    };

    const handleUndo = () => {
        setAvailability(schedules[0]?.availability || []);
        setName(schedules[0]?.name);
    };

    return (
        <div className='pt-2'>
            <GlobalHeader
                title='Availability'
                subTitle='Manage Availability with Precision'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            variant={'secondary'}
                            icon={<RotateCcw size={18} />}
                            onClick={handleUndo}
                        >
                            Undo
                        </Button>
                        <Button
                            icon={<BookmarkCheck size={18} />}
                            isLoading={isLoading}
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>
                }
            />
            <AddAvailability
                setAvailability={setAvailability}
                availability={availability}
                name={name}
                setName={setName}
                isLoading={isLoading}
                schedules={schedules}
                handleSave={handleSave}
            />
        </div>
    );
};

export default AvailabilityPage;

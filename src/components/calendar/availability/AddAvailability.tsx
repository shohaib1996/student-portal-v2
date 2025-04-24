import React, { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Schedule from './Schedule';
import { toast } from 'sonner';
import {
    TAvailability,
    TSchedule,
    TUpdateSchedule,
} from '../types/calendarTypes';
import {
    useAddNewScheduleMutation,
    useGetAllSchedulesQuery,
} from '../api/calendarApi';
import { Card } from '../ui/card';
import { Loader, Plus, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import CalendarModal from '../ui/CalendarModal';

type TProps = {
    handleSave: (_: TUpdateSchedule, id: string) => void;
    isLoading: boolean;
    schedules: TSchedule[];
    setAvailability: Dispatch<SetStateAction<TAvailability[]>>;
    availability: TAvailability[];
    name: string;
    setName: Dispatch<SetStateAction<string>>;
};

const AddAvailability = ({
    handleSave,
    isLoading,
    schedules,
    name,
    setAvailability,
    setName,
    availability,
}: TProps) => {
    const [active, setActive] = useState(0);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [createSchedule, { isLoading: isCreating }] =
        useAddNewScheduleMutation();

    const [sname, setsName] = useState('');

    const handleAddSchedule = async () => {
        if (sname) {
            try {
                const res = await createSchedule(sname).unwrap();
                if (res) {
                    toast.success('Added new availability successfully');
                    setIsCreateOpen(false);
                }
            } catch (err) {
                // globalErrorHandler(err);
            }
        }
    };

    return (
        <div className='add-availability pt-2'>
            {isLoading ? (
                <Card className='min-h-[calc(100vh-140px)] flex-col gap-2 flex items-center justify-center'>
                    <Loader className='animate-spin' />
                    <p>Loading your availability. Please wait ...</p>
                </Card>
            ) : schedules && schedules?.length > 0 ? (
                <Schedule
                    setName={setName}
                    setAvailability={setAvailability}
                    name={name}
                    availability={availability}
                    schedule={schedules[active]}
                />
            ) : (
                <div>
                    <div className='pb-2'>
                        You did not set up any schedule yet
                    </div>
                    <Button
                        icon={<Plus size={18} />}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Create new
                    </Button>
                </div>
            )}

            <CalendarModal
                className='w-[550px] md:w-[550px] lg:w-[550px]'
                allowFullScreen={true}
                open={isCreateOpen}
                setOpen={() => setIsCreateOpen(false)}
                title={'Create new schedule'}
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            onClick={() => setIsCreateOpen(false)}
                            variant={'secondary'}
                            icon={<XCircle size={18} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            isLoading={isCreating}
                            onClick={handleAddSchedule}
                        >
                            Save & close
                        </Button>
                    </div>
                }
            >
                <Input
                    placeholder='Schedule name'
                    className='mt-3'
                    value={sname}
                    onChange={(e) => setsName(e.target.value)}
                />
            </CalendarModal>
        </div>
    );
};

export default AddAvailability;

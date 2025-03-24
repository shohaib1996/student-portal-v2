import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Schedule from './Schedule';
import { toast } from 'sonner';
import { TSchedule } from '@/types/calendar/calendarTypes';
import {
    useAddNewScheduleMutation,
    useGetAllSchedulesQuery,
} from '@/redux/api/calendar/calendarApi';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalModal from '@/components/global/GlobalModal';
import { Input } from '@/components/ui/input';

const AddAvailability = () => {
    const [active, setActive] = useState(0);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [createSchedule, { isLoading: isCreating }] =
        useAddNewScheduleMutation();

    const [name, setName] = useState('');

    const { data: scheduleData, isLoading } =
        useGetAllSchedulesQuery(undefined);

    const schedules = scheduleData?.data;

    const handleUpdateList = (schedule: TSchedule) => {
        const arr = JSON.parse(JSON.stringify(schedules));
        const index = arr.findIndex((x: TSchedule) => x?._id === schedule?._id);
        if (index !== -1) {
            arr[index] = {
                ...arr[index],
                ...schedule,
            };

            // setSchedules(arr);
        }
    };

    const handleAddSchedule = async () => {
        if (name) {
            try {
                const res = await createSchedule(name).unwrap();
                if (res) {
                    toast.success(res.message);
                    setIsCreateOpen(false);
                }
            } catch (err) {
                // globalErrorHandler(err);
            }
        }
    };

    return (
        <div className='add-availability'>
            <div
                className='flex justify-between'
                // align={{ base: 'flex-start', sm: 'center' }}
                // direction={{ base: 'column', sm: 'row' }}
                // mb={25}
                // mt={10}
            >
                <div className='items-center gap-2'>
                    {schedules?.map((schedule: TSchedule, i: number) => (
                        <div
                            onClick={() => setActive(i)}
                            style={{ cursor: 'pointer' }}
                            // py={7}
                            // px={13}
                            // bg={i === active ? '#239B1C' : 'white'}
                            // radius={'md'}
                            // withBorder
                            key={i}
                        >
                            <p
                                className={`${i === active ? 'white' : 'black'} pb-3 text-black`}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {schedule?.name}
                            </p>
                        </div>
                    ))}

                    {/* <ActionIcon onClick={() => handleAddSchedule()} size={"lg"} variant='outline'>
                          <FaPlus />
                      </ActionIcon> */}
                </div>
            </div>

            {isLoading ? (
                <Card>
                    <Loader className='animate-spin' />
                </Card>
            ) : schedules && schedules?.length > 0 ? (
                <Schedule
                    handleUpdateList={handleUpdateList}
                    schedule={schedules[active]}
                />
            ) : (
                <div>
                    <div className='pb-2'>
                        You did not set up any schedule yet
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        title='Create new'
                    />
                </div>
            )}

            <GlobalModal
                allowFullScreen={true}
                open={isCreateOpen}
                setOpen={() => setIsCreateOpen(false)}
                // handleFormDataSave={handleAddSchedule}
                title={'Create new schedule'}
                // isLoading={isCreating}
            >
                <Input
                    placeholder='Schedule name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </GlobalModal>
        </div>
    );
};

export default AddAvailability;

import React, { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Schedule from './Schedule';
import { toast } from 'sonner';
import {
    TAvailability,
    TSchedule,
    TUpdateSchedule,
} from '@/types/calendar/calendarTypes';
import {
    useAddNewScheduleMutation,
    useGetAllSchedulesQuery,
} from '@/redux/api/calendar/calendarApi';
import { Card } from '@/components/ui/card';
import { Loader, Plus, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalModal from '@/components/global/GlobalModal';
import { Input } from '@/components/ui/input';

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
                    toast.success(res.message);
                    setIsCreateOpen(false);
                }
            } catch (err) {
                // globalErrorHandler(err);
            }
        }
    };

    return (
        <div className='add-availability pt-2'>
            <div className='flex justify-between'>
                <div className='items-center gap-2'>
                    {/* {schedules?.map((schedule: TSchedule, i: number) => (
                        <div
                            onClick={() => setActive(i)}
                            style={{ cursor: 'pointer' }}
                            key={i}
                        >
                            <p
                                className={`${i === active ? 'white' : 'black'} pb-3 text-black`}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {schedule?.name}
                            </p>
                        </div>
                    ))} */}

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

            <GlobalModal
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
            </GlobalModal>
        </div>
    );
};

export default AddAvailability;

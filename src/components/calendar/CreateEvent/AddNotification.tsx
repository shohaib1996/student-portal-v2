'use client';
import MultiSelect from '@/components/global/MultiSelect';
import { FormControl } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks';
import { TNotification } from '@/types/calendar/calendarTypes';
import { Bell } from 'lucide-react';
import React from 'react';

const timebeforeoptions = [
    { value: '5', label: '5 minutes before' },
    { value: '10', label: '10 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '20', label: '20 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '45', label: '45 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '120', label: '2 hour before' },
];

const AddNotification = ({
    notificaiton,
    setNotification,
    className,
}: {
    notificaiton: TNotification;
    setNotification: (_: TNotification) => void;
    className?: string;
}) => {
    const { chats } = useAppSelector((state) => state?.chat);
    return (
        <div
            className={cn(
                'grid grid-cols-2 gap-2 mt-2 bg-foreground p-2 rounded-md border border-forground-border',
                className,
            )}
        >
            <div>
                <label className='text-dark-gray text-sm'>Time Before</label>
                <Select
                    onValueChange={(val) =>
                        setNotification({
                            ...notificaiton,
                            offsetMinutes: Number(val),
                        })
                    }
                    defaultValue={String(notificaiton.offsetMinutes)}
                >
                    <FormControl>
                        <SelectTrigger className='bg-background'>
                            <div className='flex gap-2 items-center'>
                                <Bell className='mr-2 h-4 w-4' />
                                <SelectValue placeholder='Reminder 15 minutes before' />
                            </div>
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {timebeforeoptions?.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                                {op.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className='text-dark-gray text-sm'>
                    Methods (max:3)
                </label>
                <MultiSelect
                    placeholder='Select Methods'
                    onChange={(val) =>
                        setNotification({
                            ...notificaiton,
                            methods: val as (
                                "email" | "push" | "text" | "directMessage" | "crowds"
                            )[],
                        })
                    }
                    value={notificaiton.methods}
                    options={[
                        { value: 'directMessage', label: 'Chat DM' },
                        { value: 'crowds', label: 'Chat Crowds' },
                        { value: 'push', label: 'Notification' },
                        { value: 'text', label: 'Text Message' },
                        { value: 'email', label: 'Email' },
                    ]}
                />
            </div>
            {notificaiton?.methods.find(m => m === 'crowds') && (
                <div className='col-span-2'>
                    <label className='text-dark-gray text-sm'>
                        Chat Groups (max:3)
                    </label>
                    <MultiSelect
                        placeholder='Select Chat Groups (max:3)'
                        onChange={(val) =>
                            setNotification({
                                ...notificaiton,
                                chatGroups: val,
                            })
                        }
                        value={notificaiton.chatGroups}
                        options={chats
                            ?.filter((x) => x?.isChannel)
                            ?.map((x) => ({
                                value: x?._id,
                                label: x?.name || '',
                            }))}
                    />
                </div>
            )}
        </div>
    );
};

export default AddNotification;

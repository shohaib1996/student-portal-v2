'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateChats } from '@/redux/features/chatReducer';
import GlobalDialog from '../global/GlobalDialogModal/GlobalDialog';
import GlobalModal from '../global/GlobalModal';
import { FormLabel } from '../ui/form';

interface Channel {
    _id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    isReadOnly: boolean;
}

interface UpdateChannelModalProps {
    channel: Channel | null;
    handleCancel: () => void;
    isUpdateVisible: boolean;
}

function UpdateChannelModal({
    channel,
    handleCancel,
    isUpdateVisible,
}: UpdateChannelModalProps) {
    const dispatch = useDispatch();

    const [isUpdatingChannel, setIsUpdatingChannel] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

    useEffect(() => {
        if (channel) {
            setName(channel?.name || '');
            setDescription(channel?.description || '');
            setIsPublic(channel?.isPublic || false);
            setIsReadOnly(channel?.isReadOnly || false);
        }
    }, [channel]);

    const handleUpdateChannel = useCallback(() => {
        if (!name) {
            return toast.error('Name is required');
        }

        const data = {
            name,
            description,
            isReadOnly,
            isPublic,
        };

        setIsUpdatingChannel(true);
        axios
            .patch(`/chat/channel/update/${channel?._id}`, data)
            .then((res) => {
                dispatch(updateChats(res?.data?.channel));
                toast.success('Your Chat Info has been updated');
                setIsUpdatingChannel(false);
                handleCancel();
            })
            .catch((err) => {
                setIsUpdatingChannel(false);
                console.error(err);
                toast.error(
                    err?.response?.data?.error || 'Failed to update channel',
                );
            });
    }, [
        name,
        description,
        isReadOnly,
        isPublic,
        channel,
        dispatch,
        handleCancel,
    ]);

    return (
        <GlobalDialog
            open={isUpdateVisible}
            setOpen={handleCancel}
            title='Update Crowd'
            className='sm:max-w-[600px]'
            buttons={
                <Button
                    onClick={handleUpdateChannel}
                    disabled={isUpdatingChannel}
                    className='w-full max-w-[200px]'
                >
                    {isUpdatingChannel ? 'Updating...' : 'Update crowd'}
                </Button>
            }
        >
            <div className='channel-start space-y-2'>
                <div className='space-y-[2px]'>
                    <label htmlFor='name' className='block text-sm font-medium'>
                        Name<span className='text-destructive'>*</span>
                    </label>
                    <Input
                        id='name'
                        className='w-full'
                        placeholder='Enter channel name'
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className='space-y-[2px]'>
                    <label
                        htmlFor='description'
                        className='block text-sm font-medium'
                    >
                        Description
                    </label>
                    <Textarea
                        id='description'
                        className='w-full min-h-[100px] bg-background'
                        placeholder='Enter crowd description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className='space-y-[2px]'>
                    <label
                        htmlFor='isPublic'
                        className='block text-sm font-medium'
                    >
                        Type
                    </label>
                    <Select
                        value={isPublic ? 'true' : 'false'}
                        onValueChange={(value) => setIsPublic(value === 'true')}
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='true'>Public</SelectItem>
                            <SelectItem value='false'>Private</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-[2px]'>
                    <label
                        htmlFor='isReadOnly'
                        className='block text-sm font-medium'
                    >
                        Readonly
                    </label>
                    <Select
                        value={isReadOnly ? 'true' : 'false'}
                        onValueChange={(value) =>
                            setIsReadOnly(value === 'true')
                        }
                    >
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select option' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='true'>Yes</SelectItem>
                            <SelectItem value='false'>No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </GlobalDialog>
    );
}

export default UpdateChannelModal;

'use client';

import type React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, SaveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import GlobalDialog from '@/components/global/GlobalDialogModal/GlobalDialog';
import { instance } from '@/lib/axios/axiosInstance';

interface Member {
    _id: string;
    user?: {
        firstName?: string;
        fullName?: string;
    };
    role?: string;
}

interface ChatRoleProps {
    opened: boolean;
    close: () => void;
    chat: string;
    member: Member | null;
    handleUpdateCallback: (member: Member) => void;
}

const ChatRole: React.FC<ChatRoleProps> = ({
    opened,
    close,
    chat,
    member,
    handleUpdateCallback,
}) => {
    const [role, setRole] = useState('member');
    const [isUpdating, setIsUpdating] = useState(false);

    const modalClose = useCallback(() => {
        close();
    }, [close]);

    useEffect(() => {
        if (member && member.role) {
            setRole(member.role);
        } else {
            setRole('member'); // Default value
        }
    }, [member]);

    const handleSave = useCallback(() => {
        if (!member) {
            return;
        }

        const data = {
            member: member?._id,
            role,
            chat,
            actionType: 'role',
        };

        setIsUpdating(true);
        instance
            .post('/chat/member/update', data)
            .then((res) => {
                setIsUpdating(false);
                toast.success('Role updated successfully');
                handleUpdateCallback(res.data?.member);
                modalClose();
            })
            .catch((err) => {
                setIsUpdating(false);
                console.error(err);
                toast.error(
                    err?.response?.data?.error || 'Failed to update role',
                );
            });
    }, [member, role, chat, handleUpdateCallback, modalClose]);

    const handleRoleChange = (value: string) => {
        setRole(value);
    };

    return (
        <GlobalDialog
            open={opened}
            setOpen={(open) => !open && modalClose()}
            title={`${member?.user?.fullName || 'User'}'s Role Options`}
            subTitle={`Assign a role to ${member?.user?.fullName || 'the user'}.`}
            className='sm:max-w-[550px]'
            allowFullScreen={false}
            buttons={
                <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className='text-lg'
                >
                    {isUpdating ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <SaveIcon size={18} />
                    )}
                    Save & Close
                </Button>
            }
        >
            <div className='py-2'>
                <RadioGroup
                    value={role}
                    onValueChange={handleRoleChange}
                    className='space-y-0'
                    defaultValue='member'
                >
                    <div
                        className={`flex items-center space-x-2 ${role === 'admin' ? 'bg-blue-500/30 border border-primary' : 'bg-background'} rounded-lg border p-2 transition-colors hover:bg-primary-light hover:border-blue/30 duration-300`}
                    >
                        <RadioGroupItem value='admin' id='admin' />
                        <div className='flex-1'>
                            <label
                                htmlFor='admin'
                                className='text-black font-medium text-base cursor-pointer block'
                            >
                                Admin
                            </label>
                            <p className='text-dark-gray text-sm leading-tight'>
                                Oversees users, chats, settings, and security
                                for seamless communication
                            </p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center space-x-2 ${role === 'moderator' ? 'bg-blue-500/30 border border-primary' : 'bg-background'} rounded-lg border p-2 transition-colors hover:bg-primary-light hover:border-blue/30 duration-300`}
                    >
                        <RadioGroupItem value='moderator' id='moderator' />
                        <div className='flex-1'>
                            <label
                                htmlFor='moderator'
                                className='text-black font-medium text-base cursor-pointer block'
                            >
                                Moderator
                            </label>
                            <p className='text-dark-gray text-sm'>
                                Monitors chats, enforces guidelines, and manages
                                user interactions
                            </p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center space-x-2 ${role === 'member' ? 'bg-blue-500/30 border border-primary' : 'bg-background'} rounded-lg border p-2 transition-colors hover:bg-primary-light hover:border-blue/30 duration-300`}
                    >
                        <RadioGroupItem value='member' id='member' />
                        <div className='flex-1'>
                            <label
                                htmlFor='member'
                                className='text-black font-medium text-base cursor-pointer block'
                            >
                                Member
                            </label>
                            <p className='text-dark-gray text-sm'>
                                Participates in chats and collaborates with team
                                members
                            </p>
                        </div>
                    </div>
                </RadioGroup>
            </div>
        </GlobalDialog>
    );
};

export default ChatRole;

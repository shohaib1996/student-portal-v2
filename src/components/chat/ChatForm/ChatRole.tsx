'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
    const [role, setRole] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setRole(member?.role || 'member');
    }, [member]);

    const handleSave = () => {
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
        axios
            .post('/chat/member/update', data)
            .then((res) => {
                setIsUpdating(false);
                toast.success('Role updated successfully');
                handleUpdateCallback(res.data?.member);
                close();
            })
            .catch((err) => {
                setIsUpdating(false);
                console.log(err);
                toast.error(
                    err?.response?.data?.error || 'Failed to update role',
                );
            });
    };

    return (
        <Dialog open={opened} onOpenChange={(open) => !open && close()}>
            <DialogContent className='sm:max-w-[400px] p-0 bModalContent'>
                <DialogHeader className='px-6 py-4 border-b bModalHeader bg-primary dark:bg-zinc-800'>
                    <div className='flex items-center justify-between'>
                        <DialogTitle className='text-primary-foreground dark:text-zinc-100 bModalTitle'>
                            Update{' '}
                            {member?.user?.firstName || member?.user?.fullName}{' '}
                            Role!
                        </DialogTitle>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={close}
                            className='h-8 w-8 rounded-full bg-muted/50 hover:bg-muted btn-close'
                        >
                            <X className='h-4 w-4 text-muted-foreground' />
                            <span className='sr-only'>Close</span>
                        </Button>
                    </div>
                </DialogHeader>

                <div className='p-6 bModalBody dark:bg-background'>
                    <form className='space-y-6 role-form-container'>
                        <RadioGroup
                            value={role}
                            onValueChange={setRole}
                            className='space-y-4 role-form'
                        >
                            <div className='flex items-center space-x-2 input-wrapper'>
                                <RadioGroupItem value='admin' id='admin' />
                                <Label
                                    htmlFor='admin'
                                    className='text-base font-normal cursor-pointer'
                                >
                                    Admin
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2 input-wrapper'>
                                <RadioGroupItem
                                    value='moderator'
                                    id='moderator'
                                />
                                <Label
                                    htmlFor='moderator'
                                    className='text-base font-normal cursor-pointer'
                                >
                                    Moderator
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2 input-wrapper'>
                                <RadioGroupItem value='member' id='member' />
                                <Label
                                    htmlFor='member'
                                    className='text-base font-normal cursor-pointer'
                                >
                                    Member
                                </Label>
                            </div>
                        </RadioGroup>

                        <Button
                            disabled={isUpdating}
                            className='w-full button primary'
                            onClick={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            {isUpdating ? (
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            ) : null}
                            {isUpdating ? 'Updating...' : 'Update'}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatRole;

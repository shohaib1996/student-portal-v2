'use client';

import type React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface User {
    _id: string;
    firstName?: string;
    fullName?: string;
}

interface Member {
    _id: string;
    user?: User;
    isBlocked?: boolean;
}

interface UserBlockProps {
    opened: boolean;
    close: () => void;
    member: Member | null;
    chat: string;
    handleUpdateCallback: (member: Member) => void;
}

const UserBlock: React.FC<UserBlockProps> = ({
    opened,
    close,
    member,
    chat,
    handleUpdateCallback,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleBlock = () => {
        if (!member) {
            return;
        }

        setIsLoading(true);

        const data = {
            member: member?._id,
            chat: chat,
            actionType: member?.isBlocked ? 'Unblock' : 'block',
        };

        axios
            .post('/chat/member/update', data)
            .then((res) => {
                toast.success(
                    `${member?.isBlocked ? 'Unblocked' : 'Blocked'} successfully`,
                );
                handleUpdateCallback(res.data?.member);
                setIsLoading(false);
                close();
            })
            .catch((err) => {
                console.log(err);
                toast.error(
                    err?.response?.data?.error ||
                        'Failed to update member status',
                );
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={opened} onOpenChange={(open) => !open && close()}>
            <DialogContent className='sm:max-w-[480px] p-6 bModalContent'>
                <div className='reminder-box'>
                    <h2 className='text-xl font-medium text-center mb-6 message-title'>
                        Are you sure you want to{' '}
                        {member?.isBlocked ? 'unblock' : 'block'}{' '}
                        {member?.user?.firstName || member?.user?.fullName}?
                    </h2>

                    <div className='grid grid-cols-2 gap-4'>
                        <Button
                            variant='outline'
                            onClick={close}
                            disabled={isLoading}
                            className='w-full h-10 button delete'
                        >
                            Cancel
                        </Button>

                        <Button
                            variant={
                                member?.isBlocked ? 'default' : 'destructive'
                            }
                            onClick={handleBlock}
                            disabled={isLoading}
                            className='w-full h-10 button primary'
                        >
                            {isLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                            ) : null}
                            {member?.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserBlock;

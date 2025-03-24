'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, MessagesSquare } from 'lucide-react';
import { instance } from '@/lib/axios/axiosInstance';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profilePicture?: string;
    email?: string;
    isBlocked?: boolean;
}

interface UserCardProps {
    user: User;
    source?: string;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

function UserCard({
    user,
    source,
    isSelected = false,
    onSelect,
}: UserCardProps) {
    const router = useRouter();

    // Handle creating a new chat with a user
    const handleCreateChat = useCallback(() => {
        instance
            .post(`/chat/findorcreate/${user._id}`)
            .then((res) => {
                router.push(`/chat/${res.data.chat._id}`);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.error || 'Failed to create chat',
                );
            });
    }, [user._id, router]);

    return (
        <div className='flex items-center justify-between w-full'>
            <div className='flex items-center space-x-3'>
                <div className='relative'>
                    <Avatar className='h-12 w-12'>
                        <AvatarImage
                            src={user.profilePicture || '/chat/user.svg'}
                            alt={user.fullName}
                        />
                        <AvatarFallback>
                            {user.firstName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Online indicator or blocked overlay */}
                    {user.isBlocked ? (
                        <div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center'>
                            <Clock className='h-6 w-6 text-red-500' />
                        </div>
                    ) : (
                        <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white'></span>
                    )}
                </div>
                <div>
                    <h3 className='font-medium'>{user.fullName}</h3>
                    <p className='text-sm'>
                        {user.isBlocked ? (
                            <span className='text-red-500'>
                                You blocked this contact
                            </span>
                        ) : source === 'search' ? (
                            user.email
                        ) : (
                            <span className='text-green-500'>Active Now</span>
                        )}
                    </p>
                </div>
            </div>
            <Button
                variant={isSelected ? 'default' : 'primary_light'}
                size='icon'
                className='rounded-full h-10 w-10 text-primary'
                onClick={(e) => {
                    e.stopPropagation();
                    handleCreateChat();
                }}
            >
                <MessagesSquare className='h-5 w-5' />
            </Button>
        </div>
    );
}

export default UserCard;

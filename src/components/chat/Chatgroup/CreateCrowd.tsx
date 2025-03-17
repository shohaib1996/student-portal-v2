'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';

// Redux actions
// import { updateChats } from '../../../store/reducer/chatReducer';

// ShadCN UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Lucide Icons
import { Trash2, Plus, Loader2 } from 'lucide-react';

interface User {
    _id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profilePicture?: string;
    canDelete?: boolean;
}

interface CreateCrowdProps {
    isNewChannelModalVisible: boolean;
    handleCancelNewChannelModal: () => void;
    close: () => void;
    opened?: boolean;
}

interface RootState {
    theme: {
        displayMode: string;
    };
}

function CreateCrowd({
    isNewChannelModalVisible,
    handleCancelNewChannelModal,
    close,
}: any) {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchRef = useRef<HTMLInputElement>(null);

    const [isCreatingChannel, setIsCreatingChannel] = useState<boolean>(false);
    const [isUserLoading, setIsUserLoading] = useState<boolean>(false);

    const [step, setStep] = useState<number>(1);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [members, setMembers] = useState<User[]>([]);
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

    const { displayMode } = useSelector((state: RootState) => state.theme);
    const [users, setUsers] = useState<User[]>([]);

    // Channel related actions
    const handleNext = useCallback(() => {
        if (!name) {
            toast.error('Name is required');
            return;
        }
        setStep(2);
    }, [name]);

    const handlePrev = useCallback(() => {
        setStep(1);
    }, []);

    const handleAdd = useCallback(
        (user: User) => {
            setUsers((prev) => prev.filter((u) => u._id !== user._id));
            if (members.filter((u) => u._id === user._id).length > 0) {
                return;
            } else {
                setMembers((prev) => [...prev, { ...user, canDelete: true }]);
            }
        },
        [members],
    );

    const handleRemove = useCallback((member: User) => {
        setMembers((prev) => prev.filter((m) => m._id !== member._id));
    }, []);

    const handleCreateChannel = useCallback(() => {
        if (!name) {
            toast.error('Name is required');
            return;
        }

        const data = {
            name,
            description,
            users: members.map((m) => m._id),
            isReadOnly,
            isPublic,
        };

        if (data.users.length < 2) {
            toast.error('Please add at least 2 members');
            return;
        }

        setIsCreatingChannel(true);

        axios
            .post('/chat/channel/create', data)
            .then((res) => {
                // dispatch(updateChats(res.data.chat));
                setIsCreatingChannel(false);
                handleCancelNewChannelModal();
                router.push(`/chat/${res.data.chat._id}`);
                setStep(1);
                setName('');
                setDescription('');
                setMembers([]);
                toast.success('Crowd created successfully');
            })
            .catch((err) => {
                setIsCreatingChannel(false);
                toast.error(
                    err?.response?.data?.error || 'Failed to create crowd',
                );
                console.error('Error creating crowd:', err);
            });
    }, [
        name,
        description,
        members,
        isReadOnly,
        isPublic,
        dispatch,
        handleCancelNewChannelModal,
        router,
    ]);

    const handleSearchUser = useCallback((value?: string) => {
        const timeoutId = setTimeout(() => {
            setIsUserLoading(true);

            axios
                .get(`/chat/searchuser?query=${value?.trim() || ''}`)
                .then((res) => {
                    setUsers(res.data.users);
                    setIsUserLoading(false);
                })
                .catch((err) => {
                    setIsUserLoading(false);
                    toast.error('Failed to search users');
                    console.error('Error searching users:', err);
                });
        }, 200);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <Dialog open={isNewChannelModalVisible} onOpenChange={close}>
            <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='text-xl font-semibold'>
                        Create New Crowd
                    </DialogTitle>
                </DialogHeader>

                {step === 1 ? (
                    <div className='space-y-4 mt-4'>
                        <div className='space-y-2'>
                            <label
                                htmlFor='name'
                                className='text-sm font-medium'
                            >
                                Name <span className='text-red-500'>*</span>
                            </label>
                            <Input
                                id='name'
                                maxLength={40}
                                placeholder='Maximum 40 characters'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='bg-background dark:bg-gray-800'
                            />
                        </div>

                        <div className='space-y-2'>
                            <label
                                htmlFor='description'
                                className='text-sm font-medium'
                            >
                                Description
                            </label>
                            <Textarea
                                id='description'
                                maxLength={200}
                                placeholder='Maximum 200 characters'
                                value={description}
                                onChange={(e: any) =>
                                    setDescription(e.target.value)
                                }
                                className='bg-background dark:bg-gray-800 resize-none min-h-[100px]'
                            />
                        </div>

                        <div className='space-y-2'>
                            <label
                                htmlFor='type'
                                className='text-sm font-medium'
                            >
                                Type
                            </label>
                            <Select
                                defaultValue='true'
                                onValueChange={(value) =>
                                    setIsPublic(value === 'true')
                                }
                            >
                                <SelectTrigger className='w-full bg-background dark:bg-gray-800'>
                                    <SelectValue placeholder='Select type' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='true'>Public</SelectItem>
                                    <SelectItem value='false'>
                                        Private
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <label
                                htmlFor='readonly'
                                className='text-sm font-medium'
                            >
                                Read Only
                            </label>
                            <Select
                                defaultValue='false'
                                onValueChange={(value) =>
                                    setIsReadOnly(value === 'true')
                                }
                            >
                                <SelectTrigger className='w-full bg-background dark:bg-gray-800'>
                                    <SelectValue placeholder='Select option' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='true'>Yes</SelectItem>
                                    <SelectItem value='false'>No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4 mt-4'>
                        <div className='relative'>
                            <Input
                                ref={searchRef}
                                placeholder='Search users'
                                className='bg-background dark:bg-gray-800'
                                onFocus={() => handleSearchUser()}
                                onChange={(e) =>
                                    handleSearchUser(e.target.value)
                                }
                            />
                        </div>

                        {members.length > 0 && (
                            <div className='flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md'>
                                {members.map((member, i) => (
                                    <Badge
                                        key={i}
                                        variant='secondary'
                                        className='flex items-center gap-2 px-2 py-1'
                                    >
                                        <Avatar className='h-6 w-6'>
                                            <AvatarImage
                                                src={
                                                    member.profilePicture ||
                                                    '/chat/user.png'
                                                }
                                                alt={member.fullName}
                                            />
                                            <AvatarFallback>
                                                {member.fullName?.charAt(0) ||
                                                    'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className='text-xs'>
                                            {member.fullName}
                                        </span>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-transparent'
                                            onClick={() => handleRemove(member)}
                                        >
                                            <Trash2 className='h-3 w-3' />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className='bg-gray-100 dark:bg-gray-800 rounded-md p-2 max-h-[300px] overflow-y-auto'>
                            {isUserLoading ? (
                                <div className='flex justify-center py-8'>
                                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                </div>
                            ) : users.length > 0 ? (
                                users.map((user, i) => (
                                    <div
                                        key={i}
                                        className='flex justify-between items-center p-2 mb-2 bg-white dark:bg-gray-700 rounded-md'
                                    >
                                        <div className='flex items-center gap-4'>
                                            <Avatar className='h-10 w-10'>
                                                <AvatarImage
                                                    src={
                                                        user.profilePicture ||
                                                        '/chat/user.png'
                                                    }
                                                    alt={user.fullName}
                                                />
                                                <AvatarFallback>
                                                    {user.fullName?.charAt(0) ||
                                                        'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className='text-sm font-medium'>
                                                    {user.fullName}
                                                </h3>
                                                <span className='text-xs text-gray-500 dark:text-gray-400'>
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-600'
                                            onClick={() => handleAdd(user)}
                                        >
                                            <Plus className='h-4 w-4' />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className='text-center py-4 text-gray-500'>
                                    No users found
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className='flex justify-center gap-4 mt-4'>
                    {step === 1 ? (
                        <Button onClick={handleNext} className='w-40'>
                            Next
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant='outline'
                                onClick={handlePrev}
                                className='w-40'
                            >
                                Go Back
                            </Button>
                            <Button
                                onClick={handleCreateChannel}
                                disabled={isCreatingChannel}
                                className='w-40'
                            >
                                {isCreatingChannel && (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                )}
                                Create
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateCrowd;

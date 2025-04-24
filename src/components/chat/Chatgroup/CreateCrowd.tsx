'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ShadCN UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Markdown Editor
import { MarkdownEditor } from '@/components/global/MarkdownEditor/MarkdownEditor';

// Lucide Icons
import {
    ChevronLeft,
    Loader2,
    Search,
    Plus,
    X,
    Upload,
    Camera,
} from 'lucide-react';

// Import Axios instance
import { instance } from '@/lib/axios/axiosInstance';
import { TdUser } from '@/components/global/TdUser';
import Image from 'next/image';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { useFindOrCreateChatMutation } from '@/redux/api/chats/chatApi';
import { updateChats, updateLatestMessage } from '@/redux/features/chatReducer';
import { useAppDispatch } from '@/redux/hooks';
import { loadChats } from '@/actions/initialActions';
import GlobalEditor from '@/components/editor/GlobalEditor';

interface User {
    _id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
}

interface CreateCrowdProps {
    isOpen: boolean;
    isPopup?: boolean;
    onClose: () => void;
}

const CreateCrowd = ({ isOpen, onClose, isPopup }: CreateCrowdProps) => {
    const router = useRouter();
    const [findOrCreateChat, { isLoading: isCreatingChat }] =
        useFindOrCreateChatMutation();
    const searchRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef('');
    const avatarUrlRef = useRef<string | null>(null);
    const [step, setStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUserLoading, setIsUserLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    // Form data
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Wait for animation to complete before resetting
            const timer = setTimeout(() => {
                setStep(1);
                setSelectedUsers([]);
                setName('');
                setDescription('');
                setIsPublic(true);
                setIsReadOnly(false);
                setAvatarFile(null);
                setAvatarPreview(null);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            // Load initial users
            handleSearchUser('');
        }
    }, [isOpen]);

    // Handle create chat with RTK mutation
    const handleCreateChat = useCallback(
        (id: string) => {
            findOrCreateChat(id)
                .unwrap()
                .then((res) => {
                    router.push(`/chat/${res.chat._id}`);
                })
                .catch((err) => {
                    toast.error(err?.data?.error || 'Failed to create chat');
                });
        },
        [findOrCreateChat, router],
    );

    // Handle avatar upload
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle user search
    const handleSearchUser = useCallback((value?: string) => {
        setSearchQuery(value || '');

        setIsUserLoading(true);
        const timeoutId = setTimeout(() => {
            instance
                .get(`/chat/searchuser?query=${value?.trim() || ''}`)
                .then((res) => {
                    setUsers(res.data.users || []);
                    setIsUserLoading(false);
                })
                .catch((err) => {
                    setIsUserLoading(false);
                    toast.error('Failed to search users');
                    console.error('Error searching users:', err);
                });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, []);

    // Handle adding a user
    const handleAddUser = useCallback((user: User) => {
        setSelectedUsers((prev) => {
            // Check if user is already selected
            if (prev.some((u) => u._id === user._id)) {
                return prev;
            }
            return [...prev, user];
        });
    }, []);

    // Handle removing a user
    const handleRemoveUser = useCallback((userId: string) => {
        setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
    }, []);

    useEffect(() => {
        descriptionRef.current = description;
    }, [description]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Wait for animation to complete before resetting
            const timer = setTimeout(() => {
                setStep(1);
                setSelectedUsers([]);
                setName('');
                setDescription('');
                setIsPublic(true);
                setIsReadOnly(false);
                setAvatarFile(null);
                setAvatarPreview(null);
                avatarUrlRef.current = null; // Reset avatar URL ref
            }, 300);
            return () => clearTimeout(timer);
        } else {
            // Load initial users
            handleSearchUser('');
        }
    }, [isOpen]);

    // Handle avatar upload
    const uploadAvatar = useCallback(async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await instance.post('/chat/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const url = response?.data?.file?.location;
            avatarUrlRef.current = url; // Update ref with uploaded URL
            return url;
        } catch (error: any) {
            throw new Error(
                error?.response?.data?.error || 'Failed to upload avatar',
            );
        }
    }, []);

    // Create crowd with avatar upload
    const handleCreateCrowd = useCallback(async () => {
        if (selectedUsers.length < 2) {
            toast.error('Please select at least 2 users');
            return;
        }

        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }

        setIsLoading(true);
        try {
            // Upload avatar if a file is selected
            if (avatarFile) {
                const uploadedUrl = await uploadAvatar(avatarFile);
                avatarUrlRef.current = uploadedUrl; // Ensure ref is updated
            }

            const userIds = selectedUsers.map((user) => user._id);
            const data = {
                name,
                description: descriptionRef.current || '',
                users: userIds,
                isReadOnly,
                isPublic,
                avatar: avatarUrlRef.current || null, // Use ref for avatar URL
            };

            const res = await instance.post('/chat/channel/create', data);
            toast.success('Crowd created successfully');
            dispatch(updateChats(res?.data?.chat));
            dispatch(updateLatestMessage(res?.data?.chat));
            // handleCreateChat(res?.data?.chat._id);
            router.push(`/chat/${res.data.chat._id}`);
            dispatch(loadChats() as any);
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to create crowd');
            console.error('Error creating crowd:', err);
        } finally {
            setIsLoading(false);
        }
    }, [
        name,
        description,
        isPublic,
        isReadOnly,
        selectedUsers,
        avatarFile,
        router,
        onClose,
        dispatch,
        handleCreateChat,
    ]);
    // Handle next step
    const handleNext = useCallback(() => {
        if (step === 1) {
            if (selectedUsers.length < 2) {
                toast.error(
                    'Please select at least 2 users to create a new crowd',
                );
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!name.trim()) {
                toast.error('Crowd name is required');
                return;
            }
            handleCreateCrowd();
        }
    }, [step, selectedUsers, name, handleCreateCrowd]);
    // Handle back
    const handleBack = useCallback(() => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onClose();
        }
    }, [step, onClose]);

    // Render content based on current step
    const renderContent = () => {
        if (step === 1) {
            return (
                <div className='flex flex-col h-full overflow-hidden'>
                    {/* Header */}
                    <div className='flex items-center gap-2 p-2 w-full'>
                        <ChevronLeft
                            className='cursor-pointer'
                            onClick={handleBack}
                        />

                        <h2 className='text-lg font-semibold'>
                            Add Crowd Members
                        </h2>
                    </div>

                    {/* Selected users */}
                    {selectedUsers.length > 0 && (
                        <div className='flex flex-wrap gap-1 border-b border-forground-border m-2 pb-2 max-h-[200px] overflow-y-auto'>
                            {selectedUsers.map((user) => (
                                <Badge
                                    key={user._id}
                                    variant='secondary'
                                    className='flex items-center gap-1 pl-1 pr-1 py-1'
                                >
                                    <Avatar className='h-5 w-5'>
                                        <AvatarImage
                                            src={
                                                user.profilePicture ||
                                                '/chat/user.png'
                                            }
                                            alt={user.fullName}
                                        />
                                        <AvatarFallback>
                                            {user.fullName?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className='text-xs'>
                                        {user.fullName}
                                    </span>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={() =>
                                            handleRemoveUser(user._id)
                                        }
                                        className='h-4 w-4 ml-1 p-0 hover:bg-transparent'
                                    >
                                        <X className='h-3 w-3' />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Search */}
                    <div className='px-2'>
                        <div className='relative'>
                            <Input
                                ref={searchRef}
                                placeholder='Search members...'
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchUser(e.target.value)
                                }
                                className='pl-8 bg-background'
                            />
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray' />
                        </div>
                    </div>

                    {/* User list */}
                    <div className='flex-1 overflow-y-auto px-2 mt-2'>
                        {isUserLoading ? (
                            <div className='flex justify-center items-center h-40'>
                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            </div>
                        ) : (
                            <div className='divide-y'>
                                {users
                                    .filter(
                                        (user) =>
                                            // Filter out users that are already selected
                                            !selectedUsers.some(
                                                (selected) =>
                                                    selected._id === user._id,
                                            ),
                                    )
                                    .map((user) => (
                                        <div
                                            key={user?._id}
                                            className='flex items-center justify-between py-2 cursor-pointer'
                                            onClick={() => handleAddUser(user)}
                                        >
                                            <div className='flex items-center gap-3 cursor-pointer'>
                                                <TdUser user={user} />
                                            </div>
                                        </div>
                                    ))}

                                {users.length === 0 && (
                                    <div className='text-center py-10 text-gray-500'>
                                        No users found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom navigation */}
                    <div className='p-3 border-t mt-auto'>
                        <Button
                            onClick={handleNext}
                            className='w-full'
                            disabled={selectedUsers.length < 2}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className='flex flex-col h-full overflow-hidden px-2'>
                    {/* Header */}
                    <div className='flex items-center py-2 gap-2'>
                        <ChevronLeft
                            className='h-5 w-5 cursor-pointer'
                            onClick={handleBack}
                        />

                        <h2 className='text-lg font-semibold'>New Crowd</h2>
                    </div>

                    {/* Form */}
                    <div className='flex-1 overflow-y-auto space-y-2'>
                        {/* Avatar upload */}
                        <div className='flex justify-center'>
                            <div className='relative flex flex-col items-center'>
                                <div
                                    className='h-24 w-24 border-[2px] border-primary rounded-full bg-gray flex items-center justify-center overflow-hidden cursor-pointer group relative'
                                    onClick={() =>
                                        document
                                            .getElementById('avatar-upload')
                                            ?.click()
                                    }
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDragEnter={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.currentTarget.classList.add(
                                            'ring-2',
                                            'ring-primary',
                                        );
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.currentTarget.classList.remove(
                                            'ring-2',
                                            'ring-primary',
                                        );
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.currentTarget.classList.remove(
                                            'ring-2',
                                            'ring-primary',
                                        );

                                        if (
                                            e.dataTransfer.files &&
                                            e.dataTransfer.files[0]
                                        ) {
                                            const file =
                                                e.dataTransfer.files[0];
                                            setAvatarFile(file);

                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                setAvatarPreview(
                                                    event.target
                                                        ?.result as string,
                                                );
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                >
                                    {/* Image or camera icon */}
                                    {avatarPreview ? (
                                        <Image
                                            src={avatarPreview}
                                            alt='Avatar preview'
                                            width={200}
                                            height={200}
                                            className='h-full w-full object-cover'
                                        />
                                    ) : (
                                        <Image
                                            height={200}
                                            width={200}
                                            src='/default_image.png'
                                            alt='Crowd Name'
                                        />
                                    )}

                                    {/* Overlay with text */}
                                    <div className='absolute inset-0 bg-pure-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                        <Camera className='h-6 w-6 text-white' />
                                        <span className='text-xs font-semibold text-white w-full text-center'>
                                            Upload or
                                            <br />
                                            Drag & drop
                                        </span>
                                    </div>
                                </div>

                                <input
                                    id='avatar-upload'
                                    type='file'
                                    accept='image/jpeg,image/png,image/jpg'
                                    onChange={handleAvatarChange}
                                    className='hidden'
                                />

                                <div className='text-center mt-1 text-[10px] text-gray'>
                                    Upload JPEG/PNG/JPG image
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div className='space-y-1'>
                            <Label htmlFor='crowd-name'>
                                Crowd Name
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='crowd-name'
                                placeholder='Enter crowd name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={40}
                                required
                                className='bg-background'
                            />
                        </div>

                        {/* Description with Markdown Editor */}
                        <div className='space-y-1'>
                            <Label htmlFor='crowd-description'>
                                Description
                            </Label>
                            <div className='w-full'>
                                <GlobalEditor
                                    // ref={descriptionRef}
                                    value={description}
                                    onChange={(value) => {
                                        setDescription(value);
                                        descriptionRef.current = value;
                                    }}
                                    className='w-full min-h-[150px] bg-background'
                                    placeholder='Enter description'
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div className='space-y-1'>
                            <Label>Type</Label>
                            <RadioGroup
                                defaultValue='public'
                                onValueChange={(value) =>
                                    setIsPublic(value === 'public')
                                }
                                className='flex gap-4'
                            >
                                <div className='flex items-center space-x-2 border rounded-md p-2 flex-1 bg-background'>
                                    <RadioGroupItem
                                        value='public'
                                        id='public'
                                    />
                                    <Label
                                        htmlFor='public'
                                        className='cursor-pointer'
                                    >
                                        Public
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2 border rounded-md p-2 flex-1 bg-background'>
                                    <RadioGroupItem
                                        value='private'
                                        id='private'
                                    />
                                    <Label
                                        htmlFor='private'
                                        className='cursor-pointer'
                                    >
                                        Private
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Read Only */}
                        <div className='space-y-1'>
                            <Label>Read Only</Label>
                            <RadioGroup
                                defaultValue='no'
                                onValueChange={(value) =>
                                    setIsReadOnly(value === 'yes')
                                }
                                className='flex gap-4'
                            >
                                <div className='flex items-center space-x-2 border rounded-md p-2 flex-1 bg-background'>
                                    <RadioGroupItem value='yes' id='yes' />
                                    <Label
                                        htmlFor='yes'
                                        className='cursor-pointer'
                                    >
                                        Yes
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2 border rounded-md p-2 flex-1 bg-background'>
                                    <RadioGroupItem value='no' id='no' />
                                    <Label
                                        htmlFor='no'
                                        className='cursor-pointer'
                                    >
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Bottom navigation */}
                    <div className='p-4 border-t flex gap-2'>
                        <Button
                            variant='outline'
                            className='flex-1'
                            onClick={handleBack}
                        >
                            Cancel
                        </Button>
                        <Button
                            className='flex-1'
                            onClick={handleNext}
                            disabled={isLoading || !name.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Creating...
                                </>
                            ) : (
                                'Save & Close'
                            )}
                        </Button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div
            className={`${isPopup ? 'h-full' : 'h-[calc(100vh-60px)]'} w-full`}
        >
            {renderContent()}
        </div>
    );
};

export default CreateCrowd;

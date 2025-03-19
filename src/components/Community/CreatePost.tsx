import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    useCreatePostMutation,
    useGetCommunityPostsApiMutation,
} from '@/redux/api/community/community';
import { IAuthUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Images, Navigation, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { z } from 'zod';
import PortalForm from '../global/Form/PortalForm';
import PortalInput from '../global/Form/Inputs/PortalInput';
import { useUploadUserDocumentFileMutation } from '@/redux/api/documents/documentsApi';
import LoadingSpinner from '../global/Community/LoadingSpinner/LoadingSpinner';
import GlobalMarkDownEdit from '../global/Community/MarkDown/GlobalMarkDownEdit';
import uploadFile from '@/lib/uploadFile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export interface IAttachments {
    name: string;
    size: number;
    type: string;
    url: string;
}
interface ICreatePostProps {
    refetch: number;
    setRefetch: (value: number) => void;
}

const CreatePost = ({ refetch, setRefetch }: ICreatePostProps) => {
    const user: IAuthUser = useSelector((state: any) => state.auth.user);
    const [openMarkDown, setOpenMarkDown] = useState<boolean>(false);
    const [markDownText, setMarkDownText] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [getCommunityPosts, { isLoading: isFetchingPosts }] =
        useGetCommunityPostsApiMutation();
    const [uploadDocument, { isLoading: fUploadLoading }] =
        useUploadUserDocumentFileMutation({});
    const [createPost, { isLoading }] = useCreatePostMutation();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const schema = z.object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(200, 'Title should be less than 100 characters'),
    });

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);

            // Upload file immediately and store URL
            try {
                const uploadedFileUrl = await uploadFile(
                    [file],
                    uploadDocument,
                );
                console.log(uploadedFileUrl);
                if (uploadedFileUrl) {
                    toast.success('File uploaded successfully');
                    setFileUrl(uploadedFileUrl);
                }
            } catch (error) {
                console.error('File Upload Error:', error);
            }
        }
    };

    const onSubmit = async (data: any) => {
        // Extract hashtags from the markdown text
        const extractedTags =
            markDownText.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) || [];

        const attachmentData = [
            {
                name: selectedFile?.name || '',
                size: selectedFile?.size || 0,
                type: selectedFile?.type || '',
                url: fileUrl || '',
            },
        ];

        try {
            const payload: {
                title: string;
                description: string;
                attachments?: IAttachments[];
                tags: string[];
            } = {
                title: data.title,
                description: markDownText,
                attachments: fileUrl ? attachmentData : [],
                tags: extractedTags, // Store extracted tags here
            };

            const res = await createPost({ payload }).unwrap();
            if (res.success) {
                toast.success('Post created successfully');
                setOpenMarkDown(false);
                setRefetch(refetch + 1);
            } else {
                toast.error('Failed to create post');
            }

            // Here, you can make an API call to create the post
        } catch (error) {
            console.error('File Upload Error:', error);
        }
    };

    return (
        <>
            {openMarkDown ? (
                <div className='mb-common-multiplied rounded-xl bg-background p-common'>
                    <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                            <Avatar className='h-8 w-8'>
                                <AvatarImage
                                    src={user.profilePicture}
                                    alt={user.fullName}
                                />
                                <AvatarFallback>
                                    {user.fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className='font-medium text-black'>
                                    Create Post
                                </h3>
                                <p className='text-xs text-gray'>
                                    Share your thoughts with the community
                                </p>
                            </div>
                        </div>
                        <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 rounded-full'
                            onClick={() => setOpenMarkDown(false)}
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                    <PortalForm
                        onSubmit={onSubmit}
                        resolver={zodResolver(schema)}
                    >
                        <PortalInput
                            name='title'
                            type='text'
                            placeholder='Enter title for your post'
                            className='font-medium text-dark-gray'
                        />
                        <GlobalMarkDownEdit
                            value={markDownText}
                            setValue={setMarkDownText}
                            label='Description'
                        />
                        {fileUrl && (
                            <div className='relative'>
                                <Image
                                    className='h-20 w-24 rounded-md object-cover'
                                    src={fileUrl}
                                    alt='image'
                                    width={300}
                                    height={300}
                                />
                                <Button
                                    onClick={() => setFileUrl('')}
                                    variant='danger_light'
                                    className='absolute -top-2 left-20 h-5 w-2'
                                >
                                    <X />
                                </Button>
                            </div>
                        )}
                        <div className='flex justify-center gap-common'>
                            <div>
                                <Input
                                    type='file'
                                    ref={fileInputRef}
                                    style={{ display: 'none' }} // Hide the actual file input
                                    onChange={handleFileChange}
                                />
                                <Button
                                    onClick={handleButtonClick}
                                    type='button'
                                >
                                    {fUploadLoading ? (
                                        <>
                                            <LoadingSpinner /> Uploading
                                        </>
                                    ) : (
                                        <>
                                            <Images /> Gallery
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Button type='submit'>
                                {' '}
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner /> Publishing..{' '}
                                    </>
                                ) : (
                                    <>
                                        <Navigation /> Publish
                                    </>
                                )}
                            </Button>
                            {isFetchingPosts && <p>Refetching posts...</p>}
                        </div>
                    </PortalForm>
                </div>
            ) : (
                // <div className='mb-common-multiplied flex items-center gap-common-multiplied rounded-xl bg-background p-common-multiplied'>
                //     <Image
                //         className='h-12 w-12 rounded-full object-cover'
                //         src={user.profilePicture}
                //         alt={user.fullName}
                //         width={50}
                //         height={50}
                //     />
                //     <p
                //         onClick={() => setOpenMarkDown(true)}
                //         className='flex-1 cursor-pointer rounded-full bg-foreground text-gray p-common text-xs font-semibold sm:text-base'
                //     >
                //         What's on your mind, {user?.fullName}?
                //     </p>
                // </div>
                <Card className='shadow-sm border-border-primary-light mb-2'>
                    <CardContent className='p-4'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border-2 border-border shadow-sm'>
                                <AvatarImage
                                    src={user.profilePicture}
                                    alt={user.fullName}
                                />
                                <AvatarFallback>
                                    {user.fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={() => setOpenMarkDown(true)}
                                className='flex-1 text-left bg-foreground hover:bg-background transition-colors rounded-full px-4 py-2.5 text-dark-gray font-semibold'
                            >
                                What&apos;s on your mind, {user?.fullName}?
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default CreatePost;

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useEditCommunityPostsApiMutation } from '@/redux/api/community/community';

import { ICommunityPost } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Images, Navigation, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { IAttachments } from './CreatePost';
import { useUploadUserDocumentFileMutation } from '@/redux/api/documents/documentsApi';
import uploadFile from '@/lib/uploadFile';
import PortalForm from '../global/Form/PortalForm';
import PortalInput from '../global/Form/Inputs/PortalInput';
import GlobalMarkDownEdit from '../global/Community/MarkDown/GlobalMarkDownEdit';
import LoadingSpinner from '../global/Community/LoadingSpinner/LoadingSpinner';

interface IEditCommunityPostProps {
    post: ICommunityPost;
    refetch: number;
    setRefetch: (value: number) => void;
    setOpen: (value: boolean) => void;
}
const EditCommunityPost = ({
    post,
    refetch,
    setRefetch,
    setOpen,
}: IEditCommunityPostProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [fileUrls, setFileUrls] = useState(
        post?.attachments.map((attach) => attach.url || []),
    );
    const [uploadDocument, { isLoading: fUploadLoading }] =
        useUploadUserDocumentFileMutation({});
    const [editCommunityPost, { isLoading }] =
        useEditCommunityPostsApiMutation();
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

    const [markDownContent, setMarkDownContent] = useState<string>(
        post.description,
    );
    const defaultValues = {
        title: post.title,
    };

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
            markDownContent.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) ||
            [];

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
                description: markDownContent,
                attachments: fileUrl ? attachmentData : post.attachments,
                tags: extractedTags, // Store extracted tags here
            };

            const res = await editCommunityPost({
                payload,
                id: post._id,
            }).unwrap();
            if (res.success) {
                toast.success('Post Updated successfully');
                setOpen(false);
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
        <div>
            <PortalForm
                defaultValues={defaultValues}
                onSubmit={onSubmit}
                resolver={zodResolver(schema)}
            >
                <PortalInput type='text' name='title' label='Title' />
                <GlobalMarkDownEdit
                    label='Description'
                    value={markDownContent}
                    setValue={setMarkDownContent}
                />
                {fileUrl && (
                    <div className='relative'>
                        <Image
                            className='h-20 w-24 rounded-md object-fill'
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
                {post.attachments.length > 0 &&
                    fileUrls.map((attachment, i) => (
                        <div key={i} className='relative'>
                            <Image
                                className='h-20 w-24 rounded-md object-fill'
                                src={
                                    typeof attachment === 'string'
                                        ? attachment
                                        : ''
                                }
                                alt='image'
                                width={300}
                                height={300}
                            />
                            <Button
                                onClick={() =>
                                    setFileUrls(
                                        fileUrls.filter(
                                            (url) => url !== attachment,
                                        ),
                                    )
                                }
                                variant='danger_light'
                                className='absolute -top-2 left-20 h-5 w-2'
                            >
                                <X />
                            </Button>
                        </div>
                    ))}

                <div className='flex justify-center gap-common'>
                    <div>
                        <Input
                            type='file'
                            ref={fileInputRef}
                            style={{ display: 'none' }} // Hide the actual file input
                            onChange={handleFileChange}
                        />
                        <Button onClick={handleButtonClick} type='button'>
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
                                <LoadingSpinner /> Updading...{' '}
                            </>
                        ) : (
                            <>
                                <Navigation /> Edit
                            </>
                        )}
                    </Button>
                </div>
            </PortalForm>
        </div>
    );
};

export default EditCommunityPost;

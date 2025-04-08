import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    useUpdateCommentMutation,
    useUpdateRepliesMutation,
} from '@/redux/api/audio-video/audioVideos';
import { TComment } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

interface UpdateReplyProps {
    initialReply: TComment;
    onCancel: () => void;
}
const UpdateReply = ({ initialReply, onCancel }: UpdateReplyProps) => {
    const [comment, setComment] = useState(initialReply.comment);
    const [updateComment, { isLoading }] = useUpdateRepliesMutation();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            id: initialReply._id,
            data: {
                contentId: initialReply.contentId,
                comment,
                parentId: initialReply.parentId,
            },
        };
        try {
            const res = await updateComment(payload);
            if (
                res.error &&
                typeof res.error === 'object' &&
                'data' in res.error
            ) {
                const errorData = res.error.data as { error: string };
                if (errorData.error) {
                    toast.error(errorData.error);
                    return;
                }
            }
            if (res.data.success) {
                toast.success('Comment updated successfully');
                onCancel();
            }
        } catch (error: any) {
            console.error(error);
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className='relative mt-5 flex flex-col items-end gap-2'
        >
            <div className='absolute -left-12 top-common h-full w-11 border-t-2 border-[#AEAEAE]'></div>
            <div className='flex w-full gap-2'>
                <Image
                    className='h-8 w-8 rounded-full'
                    src={
                        initialReply?.user?.profilePicture ??
                        'https://img.freepik.com/premium-vector/male-character-social-network-concept_24877-17897.jpg?semt=ais_hybrid'
                    }
                    alt='avatar'
                    width={24}
                    height={24}
                    unoptimized
                />
                <Textarea
                    defaultValue={initialReply.comment}
                    onChange={(e) => setComment(e.target.value)}
                    className='rounded border border-gray-300 px-2 py-1'
                />
            </div>
            <div className='space-x-2'>
                {isLoading ? (
                    <Button type='submit'>Updating...</Button>
                ) : (
                    <Button type='submit'>Update</Button>
                )}
                <Button
                    className='border-danger'
                    variant='outline'
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default UpdateReply;

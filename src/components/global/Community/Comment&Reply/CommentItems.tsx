import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    useCreateRepliesMutation,
    useDeleteCommentsMutation,
    useGetAllMeidaRepliesQuery,
} from '@/redux/api/audio-video/audioVideos';
import { TComment } from '@/types';
import Image from 'next/image';
import {
    EllipsisVertical,
    FilePenLine,
    MessageSquareReply,
    SendHorizontal,
    Trash2,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import UpdateComment from './UpdateComment';
import { Textarea } from '@/components/ui/textarea';
import ReplyItem from './Reply';

type TCommentItemProps<TMedia> = {
    comment: TComment;
    media: TMedia;
    refetch: () => void;
};
const CommentItem = <TMedia extends Record<string, any>>({
    comment,
    media,
    refetch,
}: TCommentItemProps<TMedia>) => {
    const [showReplies, setShowReplies] = useState(false);
    const [commentId, setCommentId] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyText, setReplyText] = useState(''); // State for reply text
    const [showReplyInput, setShowReplyInput] = useState(false); // Toggle reply input visibility

    const payload = {
        parentId: commentId,
        contentId: media._id,
    };

    const { data: repliesData, isLoading } =
        useGetAllMeidaRepliesQuery(payload);
    const [delecomment] = useDeleteCommentsMutation();
    const [createReply, { isLoading: createReplyLoading }] =
        useCreateRepliesMutation();

    const toggleReplies = () => {
        setShowReplies((prev) => !prev);
        setCommentId(comment._id);
    };

    const handleReply = () => {
        setShowReplyInput(true);
        setCommentId(comment._id);
    };

    const handleDelete = async () => {
        try {
            const res = await delecomment(comment._id);
            if (
                res.error &&
                typeof res.error === 'object' &&
                'data' in res.error
            ) {
                const errorData = res.error.data as { error: string };
                if (errorData.error) {
                    toast.error(
                        'You are not authorized to delete this comment',
                    );
                    setIsDialogOpen(false);
                    return;
                }
            }
            if (res.data && res.data.success) {
                toast.success('Comment deleted successfully');
                setIsDialogOpen(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmitReply = async () => {
        // Handle the reply submission logic
        const payload = {
            parentId: commentId,
            contentId: media._id,
            comment: replyText,
        };
        try {
            const res = await createReply(payload);
            if (
                res.error &&
                typeof res.error === 'object' &&
                'data' in res.error
            ) {
                const errorData = res.error.data as { error: string };
                if (errorData.error) {
                    toast.error(
                        'You are not authorized to reply to this comment',
                    );
                    return;
                }
            }
            if (res.data && res.data.success) {
                toast.success('Reply submitted successfully');
                refetch();
                setReplyText(''); // Clear the reply text after submitting
                setShowReplyInput(false); // Hide the reply input after submitting
            }
        } catch (error) {
            toast.error('An error occurred while submitting your reply');
        }
    };

    return (
        <div className='relative my-5 border-gray-300 pl-2'>
            {isEditing ? (
                <UpdateComment
                    initialComment={comment}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <>
                    <div className='mb-2 p-1 text-center text-gray-500'>
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                    <div className='flex items-start gap-2'>
                        <Image
                            className='h-8 w-8 rounded-full'
                            src={
                                comment?.user?.profilePicture ??
                                'https://img.freepik.com/premium-vector/male-character-social-network-concept_24877-17897.jpg?semt=ais_hybrid'
                            }
                            alt='avatar'
                            width={24}
                            height={24}
                            unoptimized
                        />
                        <div>
                            <div className='flex items-start'>
                                <div className='rounded-xl bg-foreground px-common'>
                                    <strong className='text-black'>
                                        {comment?.user?.fullName}
                                    </strong>
                                    <p className='text-gray'>
                                        {comment.comment}
                                    </p>
                                </div>

                                {/* Dropdown Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant='default'
                                            className='bg-background p-0 text-black'
                                        >
                                            <EllipsisVertical />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align='end'
                                        className='w-36'
                                    >
                                        <DropdownMenuItem
                                            className='flex items-center'
                                            onClick={handleReply}
                                        >
                                            <MessageSquareReply />
                                            <span> Reply</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='flex items-center'
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <FilePenLine />
                                            <span>Update</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setIsDialogOpen(true)
                                            }
                                            className='text-danger flex items-center'
                                        >
                                            <Trash2 />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div>
                                {comment.repliesCount > 0 &&
                                    (showReplies ? (
                                        <Button
                                            onClick={toggleReplies}
                                            className='mt-2 bg-primary text-sm'
                                        >
                                            Collapse {comment.repliesCount}{' '}
                                            reply
                                            {comment.repliesCount > 1
                                                ? 'ies'
                                                : ''}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={toggleReplies}
                                            className='mt-2 bg-primary text-sm'
                                        >
                                            See {comment.repliesCount} reply
                                            {comment.repliesCount > 1
                                                ? 'ies'
                                                : ''}
                                        </Button>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Reply input section */}

                    <div>
                        {comment.repliesCount > 0 && !showReplies && (
                            <div className='absolute left-7 top-8 flex h-full items-center'>
                                <div className='h-[50%] w-0 border-b-2 border-l-2 border-[#AEAEAE]'></div>
                                <div className='h-[50%] w-3 border-b-2 border-[#AEAEAE]'></div>
                            </div>
                        )}

                        {showReplies && (
                            <div className='relative ml-common pl-2'>
                                {isLoading && <div>Loading replies...</div>}
                                <div className='absolute -top-[50px] left-1 h-full border-l-2 border-[#AEAEAE] xs:-top-[50px] sm:-top-[50px] md:-top-[50px] lg:-top-[50px]'></div>
                                <div className='ml-4'>
                                    {repliesData?.comments.map(
                                        (reply: TComment) => (
                                            <ReplyItem
                                                key={reply._id}
                                                reply={reply}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        {showReplyInput && (
                            <div className='relative ml-common mt-4 flex items-center gap-2 pl-2'>
                                <Image
                                    className='h-6 w-6 rounded-full'
                                    src={
                                        comment?.user?.profilePicture ??
                                        'https://img.freepik.com/premium-vector/male-character-social-network-concept_24877-17897.jpg?semt=ais_hybrid'
                                    }
                                    alt='avatar'
                                    width={24}
                                    height={24}
                                    unoptimized
                                />

                                <Textarea
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                    placeholder='Write a reply...'
                                    className='w-full rounded-md border-gray-300 p-2'
                                />
                                <Button
                                    variant='default'
                                    size='icon'
                                    className='absolute right-24 top-0 bg-transparent p-0 hover:scale-110'
                                    onClick={handleSubmitReply}
                                    disabled={createReplyLoading}
                                >
                                    {createReplyLoading ? (
                                        <div role='status'>
                                            <svg
                                                aria-hidden='true'
                                                className='h-8 w-8 animate-spin fill-primary text-gray-200 dark:text-gray-600'
                                                viewBox='0 0 100 101'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                                    fill='currentColor'
                                                />
                                                <path
                                                    d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                                    fill='currentFill'
                                                />
                                            </svg>
                                            <span className='sr-only'>
                                                Loading...
                                            </span>
                                        </div>
                                    ) : (
                                        <SendHorizontal
                                            className='text-primary'
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                            }}
                                        />
                                    )}
                                </Button>
                                <Button
                                    className='bg-danger text-[#fff]'
                                    onClick={() => setShowReplyInput(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    {isDialogOpen && (
                        <AlertDialog open>
                            <AlertDialogTrigger asChild></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you sure you want to delete this
                                        comment?
                                    </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <Button
                                        variant='outline'
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        No
                                    </Button>
                                    <Button
                                        variant='danger_light'
                                        onClick={handleDelete}
                                    >
                                        Yes
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </>
            )}
        </div>
    );
};

export default CommentItem;

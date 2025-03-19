import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    useDeleteCommunityPostsApiMutation,
    useProvideReactionApiMutation,
    useSavePostApiMutation,
} from '@/redux/api/community/community';
import { IAuthUser, ICommunityPost } from '@/types';
import {
    Ellipsis,
    Heart,
    MessageSquare,
    Share2,
    SmileIcon,
    ThumbsUp,
} from 'lucide-react';
import Image from 'next/image';
import { useState, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import EditCommunityPost from './EditCommunityPost';

import SharePost from './SharePost';
import ReportPost from './ReportPost';
import FormattingTime from '../global/Community/FormattingTime/FormattingTime';
import GlobalMarkDownPreview from '../global/Community/MarkDown/GlobalMarkDownPreview';
import FormattingDate from '../global/Community/FormattingDate/FormattingDate';
import LoadingSpinner from '../global/Community/LoadingSpinner/LoadingSpinner';
import Comment from '../global/Community/Comment&Reply/Comment';
import NewGlobalModal from '../global/Community/modal/GlobalModal';
import { copyToClipboard } from '@/utils/common';
import dayjs from 'dayjs';

interface ICommunityPostProps {
    post: ICommunityPost;
    refetch: number;
    setRefetch: (value: number) => void;
}
const emojies = ['❤️', '👍', '😍', '😂', '🥰', '😯'];
// Use forwardRef to allow attaching refs
const CommunityPosts = forwardRef<HTMLDivElement, ICommunityPostProps>(
    ({ post, refetch, setRefetch }, ref) => {
        const user: IAuthUser = useSelector((state: any) => state.auth.user);
        const [seeFullPost, setSeeFullPost] = useState(false);
        const [postId, setPostId] = useState<string>('');
        const [openReport, setOpenReport] = useState(false);
        const [postTitle, setPostTitle] = useState<string>('');
        const [postUrl, setPostUrl] = useState<string>('');
        const [showEmojis, setShowEmojis] = useState(false);
        const [showComments, setShowComments] = useState(false);
        const [open, setOpen] = useState(false);
        const [openEdit, setOpenEdit] = useState(false);
        const [giveReaction, { isLoading }] = useProvideReactionApiMutation();
        const [deletePost, { isLoading: deleteLoading }] =
            useDeleteCommunityPostsApiMutation();
        const [savePost, { isLoading: saveLoading }] = useSavePostApiMutation();

        const onEmojiClick = async (emoji: string, id: string) => {
            const payload = {
                symbol: emoji,
            };
            try {
                const response = await giveReaction({ payload, id }).unwrap();
                if (response.success) {
                    toast.success('Reaction given successfully');
                    setShowEmojis(false);
                    setRefetch(refetch + 1);
                }
            } catch (error) {
                console.log(error);
            }
        };

        const handlePostDelete = async (id: string) => {
            const toastId = toast.loading('Post is deleting...');
            try {
                const response = await deletePost({ id }).unwrap();
                if (response.success) {
                    toast.success('Post deleted successfully', { id: toastId });
                    setRefetch(refetch + 1);
                }
            } catch (error) {
                console.log(error);
            }
        };

        const handleEdit = () => {
            setOpenEdit(true);
        };
        const handleCopy = async (id: string) => {
            const success = await copyToClipboard(
                `https://portal.bootcampshub.ai/dashboard/community/post/${id}`,
            );
            if (success) {
                toast.success('Link copied to clipboard');
            }
        };

        const handleShare = (post: ICommunityPost) => {
            setPostTitle(post.title);
            setPostUrl(
                `https://portal.bootcampshub.ai/dashboard/community/post/${post._id}`,
            );
            setOpen(true);
        };

        const handleSave = async (post: ICommunityPost) => {
            const payload = {
                post: post._id,
                action: 'save',
            };
            const toastId = toast.loading('Post is saving...');
            try {
                const response = await savePost({ payload }).unwrap();
                if (response.success) {
                    toast.success('Post saved successfully', { id: toastId });
                    setOpen(false);
                    setOpenEdit(false);
                    setRefetch(refetch + 1);
                }
            } catch (error) {
                console.log(error);
            }
        };
        const handleUnSave = async (post: ICommunityPost) => {
            const payload = {
                post: post._id,
                action: 'save',
            };
            const toastId = toast.loading('Post is Unsaving...');
            try {
                const response = await savePost({ payload }).unwrap();
                if (response.success) {
                    toast.success('Post is Un saved successfully', {
                        id: toastId,
                    });
                    setOpen(false);
                    setOpenEdit(false);
                    setRefetch(refetch + 1);
                }
            } catch (error) {
                console.log(error);
            }
        };
        const handleReport = (post: ICommunityPost) => {
            setOpenReport(true);
            setPostTitle(post.title);
            setPostId(post._id);
        };
        const handleReportUndo = async (post: ICommunityPost) => {
            const payload = {
                post: post._id,
                action: 'report',
            };
            const toastId = toast.loading('Undo Reporting ...');
            try {
                const response = await savePost({ payload }).unwrap();
                if (response.success) {
                    toast.success('Report Undo successfully', { id: toastId });
                    setOpen(false);
                    setOpenEdit(false);
                    setRefetch(refetch + 1);
                }
            } catch (error) {
                console.log(error);
            }
        };

        return (
            <Card ref={ref} className='mb-2 p-2'>
                <CardTitle>
                    <div className='flex justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='relative'>
                                <Image
                                    className='h-10 w-10 rounded-full object-cover'
                                    src={
                                        post.createdBy.profilePicture ||
                                        'https://static.vecteezy.com/system/resources/thumbnails/002/002/403/small/man-with-beard-avatar-character-isolated-icon-free-vector.jpg'
                                    }
                                    alt={
                                        post.createdBy.fullName ||
                                        'profile picture'
                                    }
                                    height={40}
                                    width={40}
                                />
                                {/* Add online indicator if needed */}
                            </div>
                            <div>
                                <div className='flex items-center'>
                                    <span className='font-semibold text-black'>
                                        {post.createdBy.fullName}
                                    </span>
                                    <div className='ml-2 text-xs text-gray flex items-center'>
                                        <FormattingTime
                                            createdAt={post?.createdAt}
                                        />
                                    </div>
                                </div>
                                <div className='text-xs text-gray'>
                                    {dayjs(post.createdAt).format(
                                        'dddd, MMMM D, YYYY h:mm A',
                                    )}
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className='my-0 h-5 outline-none'>
                                <Ellipsis />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                    onClick={() => handleCopy(post._id)}
                                >
                                    Copy This Link
                                </DropdownMenuItem>
                                {post.isSaved ? (
                                    <DropdownMenuItem
                                        onClick={() => handleUnSave(post)}
                                    >
                                        Saved
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={() => handleSave(post)}
                                    >
                                        Save This Post
                                    </DropdownMenuItem>
                                )}
                                {post.createdBy._id === user._id ? (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handlePostDelete(post._id)
                                            }
                                        >
                                            Delete this post
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleEdit}>
                                            Edit this post
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        {post.isReported ? (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleReportUndo(post)
                                                }
                                            >
                                                Undo Report
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleReport(post)
                                                }
                                            >
                                                Report This Post
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardTitle>
                <CardContent className='relative p-0'>
                    <h1 className='text-xl font-semibold text-black my-2'>
                        {post.title}
                    </h1>
                    {/* {post?.attachments && (
                        <div>
                            {post?.attachments.map((attach) => (
                                <Image
                                    key={attach._id}
                                    className='my-common w-full'
                                    src={attach.url}
                                    alt={attach.name}
                                    width={500}
                                    height={500}
                                />
                            ))}
                        </div>
                    )}
                    <div className='mt-common'>
                        {seeFullPost ? (
                            <GlobalMarkDownPreview text={post.description} />
                        ) : (
                            <GlobalMarkDownPreview
                                text={post.description.slice(0, 300)}
                            />
                        )}
                    </div>
                    {seeFullPost ? (
                        <Button
                            onClick={() => setSeeFullPost(false)}
                            className='mt-common w-full bg-transparent text-black'
                        >
                            See less
                        </Button>
                    ) : (
                        <button
                            onClick={() => setSeeFullPost(true)}
                            className='absolute bottom-0.5 w-full bg-gradient-to-b from-transparent via-transparent via-60% to-primary-foreground/30 p-common backdrop-blur-[2px]'
                        >
                            See More
                        </button>
                    )} */}
                    <p className='text-dark-gray mb-4'>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry&apos;s standard dummy text ever since the
                        1500s, when an unknown printer took a galley of type and
                        scrambled it to make a type specimen book. Lorem Ipsum
                        is simply dummy text of the printing and typesetting
                        industry. Lorem Ipsum has been the industry&apos;s
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                    </p>

                    {/* Image Grid */}
                    <div className='grid grid-cols-2 gap-2 mb-4'>
                        <Image
                            src='/placeholder.jpg'
                            alt='Post image'
                            width={300}
                            height={200}
                            className='rounded-lg w-full h-[120px] object-cover'
                        />
                        <Image
                            src='/placeholder.jpg'
                            alt='Post image'
                            width={300}
                            height={200}
                            className='rounded-lg w-full h-[120px] object-cover'
                        />
                        <Image
                            src='/placeholder.jpg'
                            alt='Post image'
                            width={300}
                            height={200}
                            className='rounded-lg w-full h-[120px] object-cover'
                        />
                        <div className='relative'>
                            <Image
                                src='/placeholder.jpg'
                                alt='Post image'
                                width={300}
                                height={200}
                                className='rounded-lg w-full h-[120px] object-cover'
                            />
                            <div className='absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center'>
                                <span className='text-white font-medium'>
                                    +5 more
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className='text-dark-gray mb-4'>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry&apos;s standard dummy text ever since the
                        1500s, when an unknown printer took a galley of type and
                        scrambled it to make a type specimen book.
                    </p>
                </CardContent>
                <CardFooter className='space-x-common'>
                    {/* <div className='mt-common flex items-center gap-common'>
                        {Object.entries(post.reactions).map(
                            ([emoji, count]) => (
                                <div
                                    key={emoji}
                                    className='flex items-center space-x-1 rounded-lg bg-foreground px-2 py-1'
                                >
                                    <span className='text-lg'>{emoji}</span>
                                    <span className='text-sm font-medium'>
                                        {count as number}
                                    </span>
                                </div>
                            ),
                        )}
                    </div> */}
                    <div className='flex items-center gap-4 mb-2'>
                        <div className='flex items-center gap-1'>
                            <ThumbsUp className='h-4 w-4 text-blue-600 fill-current' />
                            <span className='text-sm text-dark-gray'>20</span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <Heart className='h-4 w-4 text-red-500 fill-current' />
                            <span className='text-sm text-dark-gray'>5</span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <span className='text-yellow-500 text-lg leading-none'>
                                😮
                            </span>
                            <span className='text-sm text-dark-gray'>8</span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <MessageSquare className='h-4 w-4 text-gray-500' />
                            <span className='text-sm text-dark-gray'>8</span>
                        </div>
                    </div>
                    {/* <div className='mt-common flex w-full items-center justify-between'>
                        <div
                            className='relative inline-block'
                            onMouseEnter={() => setShowEmojis(true)}
                            onMouseLeave={() => setShowEmojis(false)}
                        >
                            {isLoading ? (
                                <Button className='relative rounded-lg bg-foreground px-2 py-1 text-black'>
                                    <LoadingSpinner /> <SmileIcon />
                                </Button>
                            ) : (
                                <Button className='relative rounded-lg bg-foreground px-2 py-1 text-black'>
                                    <SmileIcon />
                                </Button>
                            )}

                            {showEmojis && (
                                <div className='absolute left-24 top-[-50px] flex -translate-x-1/2 transform space-x-2 rounded-lg border bg-background p-2 shadow-lg'>
                                    {emojies.map((emoji, index) => (
                                        <button
                                            key={index}
                                            className='text-2xl transition-transform duration-200 hover:scale-110'
                                            onClick={() =>
                                                onEmojiClick(emoji, post._id)
                                            }
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={() => handleShare(post)}
                            className='bg-transparent text-black'
                        >
                            <Share2 /> Share
                        </Button>
                    </div> */}
                </CardFooter>
                <Separator className='my-common border' />
                {showComments ? (
                    <Comment media={post} />
                ) : (
                    <div className='flex items-center gap-common-multiplied rounded-xl bg-background p-common'>
                        <Image
                            className='h-12 w-12 rounded-full object-cover'
                            src={user.profilePicture}
                            alt={user.fullName}
                            width={50}
                            height={50}
                        />
                        <p
                            onClick={() => setShowComments(true)}
                            className='flex-1 cursor-pointer rounded-full bg-foreground p-common text-xs font-semibold sm:text-base'
                        >
                            What&apos;s on your mind, {user?.fullName}?
                        </p>
                    </div>
                )}
                {openEdit && (
                    <NewGlobalModal
                        ngClass='hidden'
                        modalTitle='Edit Post'
                        triggerText=''
                        open={openEdit}
                        setOpen={setOpenEdit}
                        modalContent={
                            <EditCommunityPost
                                setOpen={setOpenEdit}
                                post={post}
                                refetch={refetch}
                                setRefetch={setRefetch}
                            />
                        }
                    />
                )}
                {setOpen && (
                    <NewGlobalModal
                        ngClass='hidden'
                        triggerText=''
                        open={open}
                        setOpen={setOpen}
                        modalContent={
                            <SharePost
                                postTitle={postTitle}
                                postUrl={postUrl}
                            />
                        }
                    />
                )}
                {openReport && (
                    <NewGlobalModal
                        ngClass='hidden'
                        triggerText=''
                        open={openReport}
                        setOpen={setOpenReport}
                        modalTitle='Please tell us why you want to report this post! (optional)'
                        modalContent={
                            <ReportPost
                                postTitle={postTitle}
                                postId={postId}
                                refetch={refetch}
                                setRefetch={setRefetch}
                                setOpenReport={setOpenReport}
                            />
                        }
                    />
                )}
            </Card>
        );
    },
);

// Set display name for better debugging
CommunityPosts.displayName = 'CommunityPosts';

export default CommunityPosts;

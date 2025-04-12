import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
    useDeleteCommunityPostsApiMutation,
    useProvideReactionApiMutation,
    useSavePostApiMutation,
} from '@/redux/api/community/community';
import { IAuthUser, ICommunityPost } from '@/types';
import {
    EllipsisVertical,
    MessageCircle,
    RefreshCw,
    Send,
    Share2,
    SmilePlus,
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
import LoadingSpinner from '../global/Community/LoadingSpinner/LoadingSpinner';
import NewGlobalModal from '../global/Community/modal/GlobalModal';
import { copyToClipboard } from '@/utils/common';
import dayjs from 'dayjs';
import { GlobalCommentsSection } from '../global/GlobalCommentSection';
import PostImageGrid from './PostImageGrid';
import { useCreateCommentsMutation } from '@/redux/api/audio-video/audioVideos';

interface ICommunityPostProps {
    post: ICommunityPost;
    refetch: number;
    setRefetch: (value: number) => void;
}
const emojies = ['❤️', '👍', '🙏', '😂', '🥰', '😯'];
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
        const [showLikesEmojis, setShowLikesEmojis] = useState(false);
        const [showComments, setShowComments] = useState(false);
        const [open, setOpen] = useState(false);
        const [openEdit, setOpenEdit] = useState(false);
        const [giveReaction, { isLoading }] = useProvideReactionApiMutation();
        const [deletePost, { isLoading: deleteLoading }] =
            useDeleteCommunityPostsApiMutation();
        const [savePost, { isLoading: saveLoading }] = useSavePostApiMutation();
        const [createComment, { isLoading: commentLoading }] =
            useCreateCommentsMutation();

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
                console.error(error);
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
                console.error(error);
            }
        };

        const handleEdit = () => {
            setOpenEdit(true);
        };
        const handleCopy = async (id: string) => {
            const success = await copyToClipboard(
                `https://portal.bootcampshub.ai/community/post/${id}`,
            );
            // if (success) {
            //     toast.success('Link copied to clipboard');
            // }
        };

        const handleShare = (post: ICommunityPost) => {
            setPostTitle(post.title);
            setPostUrl(
                `https://portal.bootcampshub.ai/community/post/${post._id}`,
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
                console.error(error);
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
                console.error(error);
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
                console.error(error);
            }
        };

        function splitText(description: string, minChars = 490) {
            const splitIndex = description.indexOf('.', minChars);

            if (splitIndex === -1) {
                return { firstPart: description, secondPart: '' };
            }

            return {
                firstPart: description.slice(0, splitIndex + 1).trim(),
                secondPart: description.slice(splitIndex + 1).trim(),
            };
        }

        const handleCommentSubmit = async (content: string) => {
            const res = await createComment({
                contentId: post._id,
                comment: content,
            }).unwrap();
            if (res.success) {
                toast.success('Comment added successfully');
                setRefetch(refetch + 1);
                setShowComments(false);
            } else {
                toast.error('Failed to add comment');
            }
        };

        return (
            <Card ref={ref} className='mb-2 p-2 bg-foreground'>
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
                                    <span className='text-base font-semibold text-black'>
                                        {post.createdBy.fullName}
                                    </span>

                                    <div className='mx-1 h-1 w-1 rounded-full bg-green-500 ring-1 ring-background'></div>

                                    <div className='text-xs text-gray flex items-center'>
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
                                <EllipsisVertical />
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
                    <h1 className='text-xl font-semibold text-black mt-2.5 mb-2'>
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
                    {post?.attachments.length > 0 ? (
                        <div>
                            <p className='text-sm leading-[22px] text-gray'>
                                {splitText(post.description).firstPart}
                            </p>

                            {/* Image Grid Section*/}
                            <PostImageGrid post={post} />

                            <p className='text-sm leading-[22px] text-gray'>
                                {splitText(post.description).secondPart}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className='text-sm leading-[22px] text-gray text-justify'>
                                {post.description}
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className='p-0 flex justify-between items-center my-2'>
                    <div className='flex items-center gap-2'>
                        {Object.entries(post.reactions).map(
                            ([emoji, count]) => (
                                <div
                                    key={emoji}
                                    className='flex items-center gap-1 rounded-2xl bg-background p-1'
                                >
                                    <span>{emoji}</span>
                                    <span className='text-sm text-dark-gray'>
                                        {count as number}
                                    </span>
                                </div>
                            ),
                        )}
                        <div className='flex items-center gap-1 rounded-2xl bg-background p-1'>
                            <div
                                className='relative inline-block cursor-pointer'
                                onMouseEnter={() => setShowEmojis(true)}
                                onMouseLeave={() => setShowEmojis(false)}
                            >
                                {isLoading ? (
                                    <span className='flex items-center gap-1'>
                                        <LoadingSpinner />{' '}
                                        <SmilePlus className='h-4 w-4 text-gray' />
                                    </span>
                                ) : (
                                    <SmilePlus className='h-4 w-4 text-gray' />
                                )}

                                {showEmojis && (
                                    <div className='absolute left-28 top-[-50px] flex -translate-x-1/2 transform space-x-2 rounded-lg border bg-background p-2 shadow-lg'>
                                        {emojies.map((emoji, index) => (
                                            <button
                                                key={index}
                                                className='text-2xl transition-transform duration-200 hover:scale-110'
                                                onClick={() =>
                                                    onEmojiClick(
                                                        emoji,
                                                        post._id,
                                                    )
                                                }
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center gap-8'>
                        <div
                            className='flex items-center gap-1 cursor-pointer'
                            onClick={() => setShowComments(true)}
                        >
                            <MessageCircle className='h-4 w-4 text-gray' />
                            <span className='text-sm text-dark-gray'>
                                {post?.commentsCount} comments
                            </span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <div
                                onClick={() => handleShare(post)}
                                className='cursor-pointer'
                            >
                                <Share2 className='h-4 w-4 text-gray' />
                            </div>
                            <span className='text-sm text-dark-gray'>
                                share
                            </span>
                        </div>
                    </div>
                </CardFooter>
                {/* Action Buttons */}
                <div className='grid grid-cols-4 border-t border-border pt-2'>
                    <div
                        className={cn(
                            'flex items-center justify-center gap-2 py-2 text-sm font-medium hover:bg-foreground relative cursor-pointer',
                            'text-dark-gray',
                        )}
                        onMouseEnter={() => setShowLikesEmojis(true)}
                        onMouseLeave={() => setShowLikesEmojis(false)}
                    >
                        <span className='flex gap-2'>
                            <ThumbsUp className='h-5 w-5' />
                            Like
                        </span>
                        {showLikesEmojis && (
                            <div className='absolute left-3/4 top-[-50px] flex -translate-x-1/2 transform space-x-2 rounded-lg border bg-background p-2 shadow-lg'>
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

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className='hidden md:flex items-center justify-center gap-2 py-2 text-sm font-medium text-dark-gray hover:bg-foreground'
                    >
                        <MessageCircle className='h-5 w-5' />
                        <span>Comment</span>
                    </button>
                    <button className='flex items-center justify-center gap-2 py-2 text-sm font-medium text-dark-gray hover:bg-foreground'>
                        <RefreshCw className='h-5 w-5' />
                        <span>Repost</span>
                    </button>
                    <button className='flex items-center justify-center gap-2 py-2 text-sm font-medium text-dark-gray hover:bg-foreground'>
                        <Send className='h-5 w-5' />
                        <span>Send</span>
                    </button>
                </div>

                {showComments && (
                    <GlobalCommentsSection
                        documentId={postId || ''}
                        onCommentSubmit={handleCommentSubmit}
                    />
                )}
                {/* <div className='flex items-center gap-common-multiplied rounded-xl bg-background p-common'>
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
                </div> */}

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

'use client';

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
import type { IAuthUser, ICommunityPost } from '@/types';
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
import { useState, forwardRef, Dispatch, SetStateAction } from 'react';
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
import PostImageGrid from './PostImageGrid';
import { useCreateCommentsMutation } from '@/redux/api/audio-video/audioVideos';
import GlobalComment from '../global/GlobalComments/GlobalComment';
import Repost from '../global/Community/Repost/Repost';
import { Button } from '../ui/button';
import { renderText } from '@/components/lexicalEditor/renderer/renderText';
import GlobalModal from '../global/GlobalModal';

interface ICommunityPostProps {
    post: ICommunityPost;
    refetch: number;
    setRefetch: (value: number) => void;
    setPosts: Dispatch<SetStateAction<ICommunityPost[]>>;
}
const emojies = ['❤️', '👍', '🙏', '😂', '🥰', '😯'];
// Use forwardRef to allow attaching refs
const CommunityPosts = forwardRef<HTMLDivElement, ICommunityPostProps>(
    ({ post, refetch, setRefetch, setPosts }, ref) => {
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
        const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
        const [postToDelete, setPostToDelete] = useState<string>('');
        const [giveReaction, { isLoading }] = useProvideReactionApiMutation();
        const [deletePost, { isLoading: deleteLoading }] =
            useDeleteCommunityPostsApiMutation();
        const [savePost, { isLoading: saveLoading }] = useSavePostApiMutation();
        const [createComment, { isLoading: commentLoading }] =
            useCreateCommentsMutation();
        const [openRepost, setOpenRepost] = useState(false);
        const [showSendModal, setShowSendModal] = useState(false);

        const onEmojiClick = async (emoji: string, id: string) => {
            const payload = {
                symbol: emoji,
            };
            const prevreactionsCount = post.reactionsCount;
            const prevreactions = post.reactions;
            const prevmyReaction = post.myReaction;

            setPosts((prev) =>
                prev.map((p) => {
                    if (p._id === id) {
                        // Case 1: User is clicking the same reaction they already have
                        if (p.myReaction === emoji) {
                            // Remove the reaction
                            // Create a new reactions object without the zero-count emoji
                            const updatedReactions = { ...p.reactions };
                            if (updatedReactions[emoji] === 1) {
                                delete updatedReactions[emoji];
                            } else {
                                updatedReactions[emoji] =
                                    ((updatedReactions[emoji] as any) || 0) - 1;
                            }

                            return {
                                ...p,
                                reactionsCount: p.reactionsCount - 1,
                                myReaction: '',
                                reactions: updatedReactions,
                            };
                        }
                        // Case 2: User already has a reaction but is changing to a different one
                        else if (p.myReaction && p.myReaction !== emoji) {
                            // Create a new reactions object
                            const updatedReactions: any = { ...p.reactions };

                            // Handle previous reaction removal
                            if (updatedReactions[p.myReaction] === 1) {
                                delete updatedReactions[p.myReaction];
                            } else {
                                updatedReactions[p.myReaction] =
                                    (updatedReactions[p.myReaction] || 0) - 1;
                            }

                            // Add new reaction
                            updatedReactions[emoji] =
                                (updatedReactions[emoji] || 0) + 1;

                            return {
                                ...p,
                                // Overall count stays the same (removing one, adding one)
                                reactionsCount: p.reactionsCount,
                                myReaction: emoji,
                                reactions: updatedReactions,
                            };
                        }
                        // Case 3: User had no reaction before and is adding one
                        else {
                            return {
                                ...p,
                                reactionsCount: p.reactionsCount + 1,
                                myReaction: emoji,
                                reactions: {
                                    ...p.reactions,
                                    [emoji]:
                                        ((p.reactions?.[emoji] as any) || 0) +
                                        1,
                                },
                            };
                        }
                    }
                    return p;
                }),
            );
            try {
                const response = await giveReaction({ payload, id }).unwrap();
                console.log(response);
                if (!response.success) {
                    setPosts((prev) =>
                        prev.map((p) => {
                            if (p._id === id) {
                                return {
                                    ...p,
                                    reactionCount: prevreactionsCount,
                                    myReaction: prevmyReaction,
                                    reactions: prevreactions,
                                };
                            }
                            return p;
                        }),
                    );
                    toast.warning(
                        'Sorry, reaction failed. please try again later',
                    );
                }
            } catch (error) {
                console.log(error);
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
                    setShowDeleteConfirm(false);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete post', { id: toastId });
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
                    setPosts((prev) =>
                        prev.map((p) => {
                            if (p._id === post._id) {
                                return { ...p, isSaved: true };
                            }
                            return p;
                        }),
                    );
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
                    toast.success('Post is Unsaved successfully', {
                        id: toastId,
                    });
                    setOpen(false);
                    setOpenEdit(false);
                    setPosts((prev) =>
                        prev.map((p) => {
                            if (p._id === post._id) {
                                return { ...p, isSaved: false };
                            }
                            return p;
                        }),
                    );
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

        const confirmDelete = (id: string) => {
            setPostToDelete(id);
            setShowDeleteConfirm(true);
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
                                        (post.createdBy
                                            ? 'https://static.vecteezy.com/system/resources/thumbnails/002/002/403/small/man-with-beard-avatar-character-isolated-icon-free-vector.jpg'
                                            : '/placeholder.svg')
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
                                                confirmDelete(post._id)
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
                                {renderText({ text: post?.description || '' })}
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
                        {/* <div className='flex items-center gap-1 rounded-2xl bg-background p-1'>
                            <div
                                className='relative inline-block cursor-pointer'
                                onMouseEnter={() => setShowEmojis(true)}
                                onMouseLeave={() => setShowEmojis(false)}
                            >
                                <SmilePlus className='h-4 w-4 text-gray' />

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
                        </div> */}
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
                        {/* <div className='flex items-center gap-1'>
                            <div
                                onClick={() => handleShare(post)}
                                className='cursor-pointer'
                            >
                                <Share2 className='h-4 w-4 text-gray' />
                            </div>
                            <span className='text-sm text-dark-gray'>
                                share
                            </span>
                        </div> */}
                    </div>
                </CardFooter>
                {/* Action Buttons */}
                <div className='grid grid-cols-4 border-t border-forground-border pt-2'>
                    <div
                        className={cn(
                            'flex items-center  rounded transition-all duration-300  justify-center gap-2 py-2 text-sm font-medium hover:bg-primary-foreground relative cursor-pointer',
                            'text-dark-gray',
                        )}
                        onMouseEnter={() => setShowLikesEmojis(true)}
                        onMouseLeave={() => setShowLikesEmojis(false)}
                    >
                        {post.myReaction ? (
                            <span className='text-xs'>{post.myReaction}</span>
                        ) : (
                            <span className='flex gap-2'>
                                <ThumbsUp className='h-5 w-5' />
                                Like
                            </span>
                        )}
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
                        className='hidden md:flex items-center justify-center gap-2 py-2 text-sm font-medium text-dark-gray hover:bg-primary-foreground  rounded transition-all duration-300 '
                    >
                        <MessageCircle className='h-5 w-5' />
                        <span>Comment</span>
                    </button>
                    <button
                        onClick={() => setOpenRepost(true)}
                        className='flex items-center justify-center gap-2 py-2 text-sm font-medium text-dark-gray hover:bg-primary-foreground  rounded transition-all duration-300 '
                    >
                        <RefreshCw className='h-5 w-5' />
                        <span>Repost</span>
                    </button>
                    <button
                        onClick={() => setShowSendModal(true)}
                        className='flex items-center justify-center gap-2 py-2 text-sm font-medium text-dark-gray hover:bg-primary-foreground rounded transition-all duration-300 '
                    >
                        <Send className='h-5 w-5' />
                        <span>Send</span>
                    </button>
                </div>

                {showComments && <GlobalComment contentId={post._id} />}

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
                {showDeleteConfirm && (
                    <NewGlobalModal
                        ngClass='hidden'
                        modalTitle='Delete Post'
                        triggerText=''
                        open={showDeleteConfirm}
                        setOpen={setShowDeleteConfirm}
                        modalContent={
                            <div className='space-y-4 p-2'>
                                <p className='text-center'>
                                    Are you sure you want to delete this post?
                                </p>
                                <p className='text-center text-sm text-muted-foreground'>
                                    This action cannot be undone.
                                </p>
                                <div className='flex justify-center gap-4 pt-2'>
                                    <button
                                        className='rounded-md bg-destructive px-4 py-2 text-white hover:bg-destructive/90'
                                        onClick={() =>
                                            handlePostDelete(postToDelete)
                                        }
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? (
                                            <LoadingSpinner />
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                    <button
                                        className='rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground'
                                        onClick={() =>
                                            setShowDeleteConfirm(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        }
                    />
                )}
                {openRepost && (
                    <GlobalModal
                        triggerText=''
                        title='Repost'
                        open={openRepost}
                        setOpen={setOpenRepost}
                    >
                        <Repost
                            post={post}
                            setOpen={setOpenRepost}
                            refetch={refetch}
                            setRefetch={setRefetch}
                        />
                    </GlobalModal>
                )}
                {showSendModal && (
                    <NewGlobalModal
                        ngClass='hidden'
                        modalTitle='Send Feature'
                        triggerText=''
                        open={showSendModal}
                        setOpen={setShowSendModal}
                        modalContent={
                            <div className='space-y-4 p-4 text-center'>
                                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                                    <Send className='h-6 w-6 text-primary' />
                                </div>
                                <h3 className='text-lg font-semibold'>
                                    Coming Soon!
                                </h3>
                                <p className='text-muted-foreground'>
                                    The direct message feature is currently in
                                    development. Stay tuned for updates!
                                </p>
                                <Button
                                    className='mt-4'
                                    onClick={() => setShowSendModal(false)}
                                >
                                    Close
                                </Button>
                            </div>
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

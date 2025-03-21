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
    EllipsisVertical,
    Heart,
    MessageSquare,
    Share2,
    SmileIcon,
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
import GlobalMarkDownPreview from '../global/Community/MarkDown/GlobalMarkDownPreview';
import FormattingDate from '../global/Community/FormattingDate/FormattingDate';
import LoadingSpinner from '../global/Community/LoadingSpinner/LoadingSpinner';
import Comment from '../global/Community/Comment&Reply/Comment';
import NewGlobalModal from '../global/Community/modal/GlobalModal';
import { copyToClipboard } from '@/utils/common';
import dayjs from 'dayjs';
import { describe } from 'node:test';

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
                    <p className='text-sm leading-[22px] text-gray'>
                        {splitText(post.description).firstPart}
                    </p>

                    {/* Image Grid */}
                    <div className='grid grid-cols-3 gap-2 my-2'>
                        <div className='space-y-2'>
                            <div className='grid grid-cols-2 gap-2'>
                                <Image
                                    src='/images/community/1.png'
                                    alt='Post image'
                                    width={996}
                                    height={747}
                                    className='rounded-lg w-full h-[174px] object-cover'
                                />
                                <Image
                                    src='/images/community/2.png'
                                    alt='Post image'
                                    width={1060}
                                    height={706}
                                    className='rounded-lg w-full h-[174px] object-cover'
                                />
                            </div>
                            <Image
                                src='/images/community/3.png'
                                alt='Post image'
                                width={740}
                                height={1109}
                                className='rounded-lg w-full h-[198px] object-cover'
                            />
                        </div>
                        <Image
                            src='/images/community/4.png'
                            alt='Post image'
                            width={1060}
                            height={706}
                            className='rounded-lg w-full h-[380px] object-cover'
                        />
                        <div className='relative'>
                            <Image
                                src='/images/community/5.png'
                                alt='Post image'
                                width={1380}
                                height={776}
                                className='rounded-lg w-full h-[380px] object-cover'
                            />
                            <div className='absolute bottom-1/4 right-1/3 bg-black/50 rounded-lg flex items-center justify-center'>
                                <span className='text-white font-semibold text-2xl'>
                                    +5 more
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className='text-sm leading-[22px] text-gray'>
                        {splitText(post.description).secondPart}
                    </p>
                </CardContent>
                <Separator className='border-border my-2' />
                <CardFooter className='space-x-common p-0'>
                    <div className='flex items-center gap-4 mb-2'>
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
                            <Heart className='h-4 w-4 text-red-500 fill-current' />
                            <span className='text-sm text-primary'>20</span>
                        </div>
                        <div className='flex items-center gap-1 rounded-2xl bg-background p-1'>
                            <span>🙏</span>
                            <span className='text-sm text-dark-gray'>5</span>
                        </div>
                        <div className='flex items-center gap-1 rounded-2xl bg-background p-1'>
                            <span className='text-yellow-500 text-lg leading-none'>
                                👍
                            </span>
                            <span className='text-sm text-dark-gray'>8</span>
                        </div> */}
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
                        <div className='flex items-center gap-1 rounded-2xl bg-background p-1'>
                            <div
                                onClick={() => handleShare(post)}
                                className='cursor-pointer'
                            >
                                <span>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='15'
                                        height='15'
                                        viewBox='0 0 15 15'
                                        fill='none'
                                    >
                                        <g clipPath='url(#clip0_27_30545)'>
                                            <path
                                                d='M10.7522 4.41529C11.9189 5.22612 12.7239 6.51529 12.8872 8.00279M2.89469 8.03195C2.96803 7.31864 3.19342 6.62933 3.55567 6.01048C3.91792 5.39164 4.40862 4.85763 4.99469 4.44445M5.63635 13.0311C6.31302 13.3753 7.08302 13.5678 7.89386 13.5678C8.67552 13.5678 9.41052 13.3928 10.0697 13.072M7.89386 5.30779C8.32395 5.30779 8.73643 5.13693 9.04055 4.83281C9.34467 4.52869 9.51552 4.11621 9.51552 3.68612C9.51552 3.25603 9.34467 2.84355 9.04055 2.53943C8.73643 2.23531 8.32395 2.06445 7.89386 2.06445C7.46376 2.06445 7.05128 2.23531 6.74716 2.53943C6.44304 2.84355 6.27219 3.25603 6.27219 3.68612C6.27219 4.11621 6.44304 4.52869 6.74716 4.83281C7.05128 5.13693 7.46376 5.30779 7.89386 5.30779ZM3.67635 12.4361C4.10645 12.4361 4.51892 12.2653 4.82305 11.9611C5.12717 11.657 5.29802 11.2445 5.29802 10.8145C5.29802 10.3844 5.12717 9.97188 4.82305 9.66776C4.51892 9.36364 4.10645 9.19279 3.67635 9.19279C3.24626 9.19279 2.83378 9.36364 2.52966 9.66776C2.22554 9.97188 2.05469 10.3844 2.05469 10.8145C2.05469 11.2445 2.22554 11.657 2.52966 11.9611C2.83378 12.2653 3.24626 12.4361 3.67635 12.4361ZM12.0414 12.4361C12.4714 12.4361 12.8839 12.2653 13.188 11.9611C13.4922 11.657 13.663 11.2445 13.663 10.8145C13.663 10.3844 13.4922 9.97188 13.188 9.66776C12.8839 9.36364 12.4714 9.19279 12.0414 9.19279C11.6113 9.19279 11.1988 9.36364 10.8947 9.66776C10.5905 9.97188 10.4197 10.3844 10.4197 10.8145C10.4197 11.2445 10.5905 11.657 10.8947 11.9611C11.1988 12.2653 11.6113 12.4361 12.0414 12.4361Z'
                                                stroke='#5C5958'
                                                strokeWidth='1.2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id='clip0_27_30545'>
                                                <rect
                                                    width='14'
                                                    height='14'
                                                    fill='white'
                                                    transform='translate(0.859375 0.816406)'
                                                />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </span>
                            </div>
                            <span className='text-sm text-dark-gray'>8</span>
                        </div>
                    </div>
                </CardFooter>

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

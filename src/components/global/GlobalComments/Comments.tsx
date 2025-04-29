import Image from 'next/image';
import React, { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CommentType } from './GlobalComment';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import GlobalDropdown from '@/components/global/GlobalDropdown';
import {
    EllipsisVertical,
    MessageCircleReply,
    RefreshCcw,
    Trash,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import dayjs from 'dayjs';

interface CommentsProps {
    comments: CommentType[];
    isModal?: boolean;
    commentInput: (props: {
        parentId?: string;
        comment: string;
        setComment: React.Dispatch<React.SetStateAction<string>>;
        isReply?: boolean;
    }) => ReactNode;
    replies: CommentType[];
    contentId: string;
    currentReply: string | null;
    setCurrentReply: React.Dispatch<React.SetStateAction<string | null>>;
    handleDelete: (id: string) => void;
    openReplies: string[];
    setOpenReplies: React.Dispatch<React.SetStateAction<string[]>>;
    handleUpdate: ({
        id,
        parentId,
        contentId,
        comment,
    }: {
        id: string;
        parentId?: string;
        contentId: string;
        comment: string;
    }) => void;
    isUpdate: string;
    setUpdate: React.Dispatch<React.SetStateAction<string>>;
    wrapperHight?: string;
    bgColor?: 'foreground' | 'background';
}

const Comments = ({
    comments,
    isModal,
    commentInput,
    replies,
    contentId,
    currentReply,
    setCurrentReply,
    handleDelete,
    openReplies,
    setOpenReplies,
    handleUpdate,
    isUpdate,
    setUpdate,
    wrapperHight,
    bgColor,
}: CommentsProps) => {
    const [reply, setReply] = useState('');
    const { user } = useAppSelector((state) => state.auth);
    const [updateComment, setUpdateComment] = useState('');
    const [level2Visible, setLevel2Visible] = useState(false);
    const authUser = user;
    const [groupedComments, setGroupedComments] = useState<Record<string, any>>(
        {},
    );

    useEffect(() => {
        const groupedComments: Record<string, CommentType[]> = comments.reduce(
            (acc: Record<string, CommentType[]>, comment) => {
                const date: string = comment.updatedAt.split('T')[0]; // Extract the date
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(comment);
                return acc;
            },
            {} as Record<string, CommentType[]>, // Explicitly define the type of the accumulator
        );

        setGroupedComments(groupedComments);
    }, [comments]);

    const handleResize = (event: any) => {
        event.target.style.height = 'auto';
        event.target.style.height = event.target.scrollHeight + 'px';
    };

    const handleFocus = (e: any, text: any) => {
        handleResize(e);
        e.target.setSelectionRange(text.length, text.length);
    };

    const renderComment = ({
        user,
        text,
        isReply = false,
        customClass,
        parentId,
        id,
        contentId,
    }: {
        user: any;
        text: string;
        isReply?: boolean;
        customClass?: string;
        parentId?: string;
        id: string;
        contentId: string;
    }) => {
        const commentReplies = replies.filter((re) => re.parentId === id) || [];

        return (
            <div className={`comment-content ${customClass}`}>
                <div
                    className={`comment`}
                    style={{
                        paddingRight: `${isModal && '0px'}`,
                    }}
                >
                    <div>
                        <Image
                            src={user?.profilePicture || '/avatar.png'}
                            alt='user'
                            width={40}
                            height={40}
                        />
                    </div>
                    {isUpdate === id ? (
                        <div className='flex flex-col w-full items-end'>
                            <textarea
                                onFocus={(e) => handleFocus(e, text)}
                                onInput={handleResize}
                                className='text-black bg-background border-forground-border outline-none border rounded-md p-2 bg-foreground'
                                defaultValue={text}
                                autoFocus={true}
                                onChange={(e) =>
                                    setUpdateComment(e.target.value)
                                }
                            ></textarea>
                            <div className='flex gap-3 update-btn'>
                                <Button
                                    variant='destructive'
                                    title='Cancel'
                                    type='button'
                                    onClick={() => setUpdate('')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant='default'
                                    title='Update'
                                    type='button'
                                    onClick={() =>
                                        handleUpdate({
                                            id: id,
                                            parentId: parentId,
                                            contentId: contentId,
                                            comment: updateComment,
                                        })
                                    }
                                >
                                    Update
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-3 rounded-md bg-${bgColor}`}>
                            <h4 style={{ display: 'block' }}>
                                {user?.fullName}
                            </h4>
                            <p className='whitespace-pre-wrap'>{text}</p>
                        </div>
                    )}
                    <Popover>
                        <PopoverTrigger>
                            {!isReply && (
                                <button
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <EllipsisVertical />
                                </button>
                            )}
                            {isReply && user._id === authUser?._id && (
                                <button
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <EllipsisVertical />
                                </button>
                            )}
                        </PopoverTrigger>
                        <PopoverContent className='p-2 max-w-36'>
                            <div className='flex flex-col items-start gap-1'>
                                {!isReply && (
                                    <div
                                        onClick={() => {
                                            setCurrentReply(id);
                                            setUpdate('');
                                        }}
                                        className='flex items-center w-full bg-background py-1 px-3 text-dark-gray hover:bg-primary-light cursor-pointer gap-2 border border-forground-border rounded-md'
                                    >
                                        <MessageCircleReply size={18} />
                                        Reply
                                    </div>
                                )}
                                {authUser?._id === user._id && (
                                    <>
                                        <div
                                            onClick={() => setUpdate(id)}
                                            className='flex bg-background items-center w-full py-1 px-3 text-dark-gray hover:bg-primary-light cursor-pointer gap-2 border border-forground-border rounded-md'
                                        >
                                            <RefreshCcw size={18} />
                                            Update
                                        </div>

                                        <div
                                            onClick={() => handleDelete(id)}
                                            className='flex items-center w-full bg-background py-1 px-3 border border-forground-border rounded-md hover:bg-primary-light text-destructive cursor-pointer gap-2'
                                        >
                                            <Trash
                                                size={18}
                                                className='deleteIcon'
                                            />
                                            <span
                                                style={{ paddingTop: '.8px' }}
                                            >
                                                Delete
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                {commentReplies.length !== 0 &&
                    !openReplies.find((rep) => rep === id) && (
                        <button
                            className='level-2 see-reply after:border-b-2 after:border-forground-border  after:border-l-2 '
                            onClick={() => {
                                setOpenReplies((prev) => [...prev, id]);
                                setLevel2Visible(!level2Visible);
                            }}
                        >
                            See {commentReplies.length} replies
                        </button>
                    )}
                {!isReply &&
                    openReplies.find((rep) => rep === id) &&
                    commentReplies.map((re) => {
                        return renderComment({
                            contentId: re.contentId,
                            parentId: re.parentId,
                            id: re._id,
                            isReply: true,
                            text: re.comment,
                            user: re?.user,
                            customClass: 'level-2',
                        });
                    })}
                {currentReply === id && (
                    <div style={{ paddingLeft: '50px' }}>
                        <p
                            className='comment-reply textBlack'
                            onClick={() => setCurrentReply(null)}
                        >
                            Reply
                        </p>
                        {commentInput({
                            parentId: id,
                            comment: reply,
                            setComment: setReply,
                            isReply: true,
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className='comment-wrapper'
            style={{
                padding: `${isModal && ''}`,
                maxHeight: wrapperHight,
            }}
        >
            <div className='comment-container'>
                {Object.keys(groupedComments).map((date) => {
                    const formattedDate = dayjs(date).isSame(dayjs(), 'day')
                        ? 'Today'
                        : dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
                          ? 'Yesterday'
                          : dayjs(date).format('MMMM DD, YYYY');

                    return (
                        <div key={date}>
                            <div className='text-center flex flex-row items-center gap-2'>
                                <div className='h-[1px] bg-forground-border w-full'></div>
                                <p className='bg-primary-light px-3 py-1 rounded-full  text-xs text-nowrap w-fit'>
                                    {formattedDate}
                                </p>
                                <div className='h-[1px] bg-forground-border w-full'></div>
                            </div>
                            {groupedComments[date].map((d: any, i: number) => {
                                const {
                                    comment,
                                    updatedAt,
                                    contentId,
                                    user,
                                    repliesCount,
                                    _id,
                                } = d;

                                return (
                                    <div key={_id} className='comment-content'>
                                        {renderComment({
                                            contentId,
                                            user,
                                            // date: updatedAt,
                                            text: comment,
                                            customClass: repliesCount
                                                ? 'level-1'
                                                : '',
                                            id: _id,
                                            isReply: false,
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Comments;

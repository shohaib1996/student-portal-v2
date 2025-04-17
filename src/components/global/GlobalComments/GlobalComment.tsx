import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import Comments from './Comments';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import './comment.css';
import { Send, Smile } from 'lucide-react';
import GlobalDropdown from '@/components/global/GlobalDropdown';
import Picker from 'emoji-picker-react';
import { instance } from '@/lib/axios/axiosInstance';
import Swal from 'sweetalert2';

export interface CommentType {
    _id: string;
    contentId: string;
    comment: string;
    user: {
        profilePicture: string;
        lastName: string;
        _id: string;
        firstName: string;
        fullName: string;
    };
    createdAt: string;
    updatedAt: string;
    parentId?: string;
    __v: number;
    repliesCount: number;
}

interface GlobalCommentProps {
    contentId: string;
    withInput?: boolean;
    cbPost?: () => void;
    cbDelete?: () => void;
    focused?: boolean;
    wrapperHight?: string;
    bgColor?: 'foreground' | 'background';
}

const GlobalComment: React.FC<GlobalCommentProps> = ({
    contentId,
    withInput = true,
    cbPost,
    cbDelete,
    focused = true,
    wrapperHight = '500px',
    bgColor = 'background',
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [comments, setComments] = useState<CommentType[]>([]);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const replyRef = useRef<HTMLTextAreaElement>(null);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [currentReply, setCurrentReply] = useState<string | null>(null);
    const [openReplies, setOpenReplies] = useState<string[]>([]);
    const [isUpdate, setUpdate] = useState<string>('');
    const [commentType, setCommentType] = useState<string>('');
    const { theme } = useTheme();

    const fetchReplies = () => {
        let newReplies: CommentType[] = [];
        Promise.all(
            comments.map(async (comment) => {
                return instance
                    .get(
                        `/content/comment/get/${contentId}?parentId=${comment._id}`,
                    )
                    .then((res) => {
                        const uniqueReplies = res.data.comments.filter(
                            (newReply: CommentType) =>
                                !replies.some(
                                    (existingReply) =>
                                        existingReply._id === newReply._id,
                                ),
                        );
                        newReplies = [...uniqueReplies, ...newReplies];
                    })
                    .catch((err) => console.error(err));
            }),
        ).then(() => {
            setReplies((prevReplies) => {
                const filteredReplies = newReplies.filter(
                    (newReply) =>
                        !prevReplies.some(
                            (existingReply) =>
                                existingReply._id === newReply._id,
                        ),
                );
                return [...filteredReplies, ...prevReplies];
            });
        });
    };

    const fetchComments = () => {
        if (contentId) {
            instance
                .get(`/content/comment/get/${contentId}`)
                .then((res) => {
                    setComments(res.data.comments);
                    if (res.data) {
                        fetchReplies();
                    }
                })
                .catch((err) => console.error(err));
        }
    };

    useEffect(() => {
        fetchComments();
    }, [contentId]);

    useEffect(() => {
        fetchReplies();
    }, [comments]);

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this comment',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                instance
                    .delete(`/content/comment/delete/${id}`)
                    .then(() => {
                        setReplies((prev) => prev.filter((c) => c._id !== id));
                        fetchComments();
                        fetchReplies();
                        cbDelete?.();
                        Swal.fire(
                            'Deleted!',
                            'Your comment has been deleted',
                            'success',
                        );
                    })
                    .catch(() => {
                        Swal.fire(
                            'Sorry!',
                            'Could not delete your comment. Please try again later',
                            'error',
                        );
                    });
            }
        });
    };

    const handleUpdate = ({
        id,
        parentId,
        contentId,
        comment,
    }: {
        id: string;
        parentId?: string;
        contentId: string;
        comment: string;
    }) => {
        if (comment && comment.trim() !== '') {
            const data = {
                contentId: contentId,
                comment: comment,
                parentId: '',
            };

            if (parentId) {
                data.parentId = parentId;
            }

            instance
                .patch(`/content/comment/update/${id}`, data)
                .then((res) => {
                    setReplies((prevReplies) => {
                        const index = prevReplies.findIndex(
                            (reply) => reply._id === id,
                        );
                        if (index === -1) {
                            return prevReplies;
                        }
                        const updatedReply = { ...prevReplies[index] };
                        updatedReply.comment = comment;
                        const updatedReplies = [...prevReplies];
                        updatedReplies[index] = updatedReply;
                        return updatedReplies;
                    });
                    fetchComments();
                    fetchReplies();
                    setUpdate('');
                    toast.success('Message updated successfully');
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            toast.warning('Please write something');
        }
    };

    const handleSubmit = ({
        parentId,
        comment,
        setComment,
        isReply,
    }: {
        parentId?: string;
        comment: string;
        setComment: React.Dispatch<React.SetStateAction<string>>;
        isReply: boolean;
    }) => {
        if (comment.trim() !== '') {
            const reqBody: {
                contentId: string;
                comment: string;
                parentId?: string;
            } = { contentId, comment };
            if (parentId) {
                reqBody.parentId = parentId;
            }

            setIsSubmitting(true);
            instance
                .post('/content/comment/create', reqBody)
                .then(() => {
                    cbPost?.();
                    setIsSubmitting(false);
                    fetchComments();
                    fetchReplies();
                    setComment('');
                    setCurrentReply(null);
                    if (parentId) {
                        setOpenReplies((prev) => [...prev, parentId]);
                    }
                })
                .catch(() => {
                    setIsSubmitting(false);
                    setComment('');
                });
        } else {
            toast.warning('Please write something');
        }
    };

    const commentInput = ({
        parentId,
        comment,
        setComment,
        isReply = false,
    }: {
        parentId?: string;
        comment: string;
        setComment: React.Dispatch<React.SetStateAction<string>>;
        isReply?: boolean;
    }) => {
        return (
            <div className={parentId ? 'comments-input-wrapper' : ''}>
                <div className='comment-input'>
                    <Image
                        className='comment-img'
                        src={user?.profilePicture || ''}
                        height={40}
                        width={40}
                        alt={user?.firstName || ''}
                    />
                    <div className={`input-container bg-${bgColor}`}>
                        <GlobalDropdown
                            className='emoji_drop'
                            dropdownRender={
                                <Picker
                                    onEmojiClick={(event) =>
                                        setComment((prev) => prev + event.emoji)
                                    }
                                />
                            }
                        >
                            <a onClick={(e) => e.preventDefault()}>
                                <Smile size={16} />
                            </a>
                        </GlobalDropdown>
                        <textarea
                            className={`bg-${bgColor}`}
                            id={isReply ? 'reply-input' : 'base-input'}
                            ref={isReply ? replyRef : inputRef}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder='Type your comment'
                            autoFocus={focused}
                        ></textarea>
                        <button
                            className='send-button'
                            disabled={isSubmitting}
                            onClick={() =>
                                handleSubmit({
                                    parentId,
                                    comment,
                                    setComment,
                                    isReply,
                                })
                            }
                        >
                            <Send size={24} className='stroke-primary-white' />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {contentId && (
                <div className='p-2'>
                    <Separator className='bg-forground-border' />
                    <h2 className='text-lg font-semibold text-dark-gray pb-2'>
                        Comments
                    </h2>
                    {withInput && commentInput({ comment, setComment })}
                    <Comments
                        commentInput={commentInput}
                        comments={comments}
                        handleDelete={handleDelete}
                        replies={replies}
                        contentId={contentId}
                        currentReply={currentReply}
                        setCurrentReply={setCurrentReply}
                        openReplies={openReplies}
                        setOpenReplies={setOpenReplies}
                        isUpdate={isUpdate}
                        setUpdate={setUpdate}
                        wrapperHight={wrapperHight}
                        handleUpdate={handleUpdate}
                        bgColor={bgColor}
                    />
                    {comments.length === 0 && (
                        <p className='not-available textBlack'>
                            No comments available
                        </p>
                    )}
                </div>
            )}
        </>
    );
};

export default GlobalComment;

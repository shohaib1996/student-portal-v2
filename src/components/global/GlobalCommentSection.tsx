'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGetDocumentCommentsQuery } from '@/redux/api/documents/documentsApi';
import { Heart, MessageSquare, MoreVertical, Send, Smile } from 'lucide-react';

export interface Comment {
    id: string;
    author: string;
    avatar: string;
    time: string;
    content: string;
    additionalText?: string;
    likes: number;
    replies: number;
}

interface GlobalCommentsSectionProps {
    documentId?: string;
    comments?: Comment[];
    currentUserAvatar?: string;
    onCommentSubmit?: (content: string) => void;
    isTitleEnable?: boolean;
}

export function GlobalCommentsSection({
    documentId,
    comments: propComments = [],
    currentUserAvatar = '/images/author.png',
    onCommentSubmit,
    isTitleEnable = true,
}: GlobalCommentsSectionProps) {
    // Fetch comments from API if documentId is provided
    const { data, error, isLoading } = documentId
        ? useGetDocumentCommentsQuery(documentId)
        : { data: null, error: null, isLoading: false };

    // Use API data if documentId exists, otherwise use prop comments
    const commentsToDisplay = documentId
        ? data?.comments || []
        : propComments.map((comment) => ({
              _id: comment.id,
              comment: comment.content,
              createdAt: comment.time,
              repliesCount: comment.replies,
              user: {
                  fullName: comment.author,
                  profilePicture: comment.avatar,
              },
          }));

    if (isLoading) {
        return <div>Loading comments...</div>;
    }

    if (error) {
        return <div>Error loading comments</div>;
    }

    return (
        <div className='mt-2 border-t pt-2'>
            {isTitleEnable && (
                <h3 className='mb-2 text-sm font-medium'>
                    Comments ({commentsToDisplay.length})
                </h3>
            )}

            {/* Comments list */}
            <div className='space-y-2'>
                {commentsToDisplay.map((comment) => (
                    <div
                        key={comment._id}
                        className='rounded-md border p-4 bg-background'
                    >
                        <div className='mb-2 flex items-start justify-between'>
                            <div className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage
                                        src={comment.user.profilePicture}
                                        alt={comment.user.fullName}
                                    />
                                    <AvatarFallback>
                                        {comment.user.fullName?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className='text-sm font-medium'>
                                        {comment.user.fullName}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        {new Date(
                                            comment.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                            >
                                <MoreVertical className='h-4 w-4' />
                            </Button>
                        </div>
                        <p className='mb-2 text-sm'>{comment.comment}</p>
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                            {comment.repliesCount > 0 && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 gap-1 p-0 text-xs font-normal'
                                >
                                    Replies {comment.repliesCount}
                                </Button>
                            )}
                            <div className='flex items-center gap-1'>
                                <Heart className='h-3 w-3 fill-current text-red-500' />
                                <span>0</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <MessageSquare className='h-3 w-3' />
                                <span>{comment.repliesCount}</span>
                            </div>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 gap-1 p-0 text-xs font-normal'
                            >
                                <Smile className='h-3 w-3' />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment input */}
            <div className='mt-4 flex items-start gap-2'>
                <Avatar className='h-8 w-8'>
                    <AvatarImage src={currentUserAvatar} alt='Your avatar' />
                    <AvatarFallback>YA</AvatarFallback>
                </Avatar>
                <div className='relative flex-1'>
                    <Textarea
                        placeholder='Write a comment...'
                        className='min-h-[40px] resize-none pr-10 bg-background'
                        onKeyUp={(e) => {
                            if (
                                e.key === 'Enter' &&
                                !e.shiftKey &&
                                onCommentSubmit
                            ) {
                                e.preventDefault();
                                onCommentSubmit(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                    <Button
                        size='icon'
                        variant='ghost'
                        className='absolute bottom-1 right-1 h-8 w-8 rounded-full'
                        onClick={() => {
                            const textarea = document.querySelector('textarea');
                            if (textarea && onCommentSubmit) {
                                onCommentSubmit(textarea.value);
                                textarea.value = '';
                            }
                        }}
                    >
                        <Send className='h-4 w-4 hover:bg-primary' />
                        <span className='sr-only'>Send comment</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

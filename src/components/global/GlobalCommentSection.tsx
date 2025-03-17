'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    comments: Comment[];
    currentUserAvatar?: string;
    onCommentSubmit?: (content: string) => void;
}

export function GlobalCommentsSection({
    comments,
    currentUserAvatar = '/images/author.png',
    onCommentSubmit,
}: GlobalCommentsSectionProps) {
    return (
        <div className='mt-6 border-t pt-4'>
            <h3 className='mb-3 text-sm font-medium'>
                Comments ({comments.length})
            </h3>

            {/* Comments list */}
            <div className='space-y-4'>
                {comments.map((comment) => (
                    <div key={comment.id} className='rounded-md border p-4'>
                        <div className='mb-2 flex items-start justify-between'>
                            <div className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage
                                        src={comment.avatar}
                                        alt={comment.author}
                                    />
                                    <AvatarFallback>
                                        {comment.author[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className='text-sm font-medium'>
                                        {comment.author}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        {comment.time}
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
                        <p className='mb-2 text-sm'>{comment.content}</p>
                        {comment.additionalText && (
                            <p className='mb-2 text-sm'>
                                {comment.additionalText}
                            </p>
                        )}
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                            {comment.replies > 0 && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 gap-1 p-0 text-xs font-normal'
                                >
                                    Replies {comment.replies}
                                </Button>
                            )}
                            <div className='flex items-center gap-1'>
                                <Heart className='h-3 w-3 fill-current text-red-500' />
                                <span>{comment.likes}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <MessageSquare className='h-3 w-3' />
                                <span>{comment.replies}</span>
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
                        className='min-h-[40px] resize-none pr-10'
                        onKeyPress={(e) => {
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
                        <Send className='h-4 w-4' />
                        <span className='sr-only'>Send comment</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

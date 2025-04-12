import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreatePostMutation } from '@/redux/api/community/community';
import { ICommunityPost } from '@/types';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import GlobalMarkDownEdit from '../MarkDown/GlobalMarkDownEdit';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

interface RepostProps {
    post: ICommunityPost;
    setOpen: (open: boolean) => void;
    refetch: number;
    setRefetch: (value: number) => void;
}

const Repost = ({ post, setOpen, refetch, setRefetch }: RepostProps) => {
    const user = useSelector((state: any) => state.auth.user);
    const [comment, setComment] = useState<string>('');
    const [createPost, { isLoading }] = useCreatePostMutation();

    const handleRepost = async () => {
        try {
            // Format the repost content with attribution in bold and the original post content
            const repostDescription = `${comment ? comment + '\n\n' : ''}🔄 REPOSTED FROM @${post.createdBy.fullName} 🔄\n\n${post.description}`;

            // Extract hashtags from both the comment and original post
            const extractedTags = (
                comment.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) || []
            ).concat(
                post.description
                    .match(/#(\w+)/g)
                    ?.map((tag) => tag.substring(1)) || [],
            );

            // Create unique tags array
            const uniqueTags = [...new Set(extractedTags)];

            const payload = {
                title: `${post.title}`,
                description: repostDescription,
                originalPostId: post._id,
                tags: uniqueTags,
                // Maintain attachments from the original post if needed
                attachments:
                    post.attachments?.map((attach) => ({
                        name: attach.name || '',
                        size: attach.size || 0,
                        type: attach.type || '',
                        url: attach.url || '',
                    })) || [],
            };

            const response = await createPost({ payload }).unwrap();

            if (response.success) {
                toast.success('Post reposted successfully');
                setRefetch(refetch + 1);
                setOpen(false);
            } else {
                toast.error('Failed to repost');
            }
        } catch (error) {
            console.error('Repost Error:', error);
            toast.error('Error reposting. Please try again.');
        }
    };

    return (
        <div className='space-y-4 p-2'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <Avatar className='h-8 w-8'>
                        <AvatarImage
                            src={user.profilePicture}
                            alt={user.fullName}
                        />
                        <AvatarFallback>
                            {user.fullName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className='font-medium text-black'>Repost</h3>
                        <p className='text-xs text-gray'>
                            Share this post with your followers
                        </p>
                    </div>
                </div>
                <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 rounded-full'
                    onClick={() => setOpen(false)}
                >
                    <X className='h-4 w-4' />
                </Button>
            </div>

            {/* Original post preview */}
            <div className='border rounded-md p-3 bg-background/50'>
                <div className='flex items-center gap-2 mb-2'>
                    <Avatar className='h-6 w-6'>
                        <AvatarImage
                            src={
                                post.createdBy.profilePicture ||
                                '/placeholder.svg'
                            }
                            alt={post.createdBy.fullName}
                        />
                        <AvatarFallback>
                            {post.createdBy.fullName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-semibold'>
                        {post.createdBy.fullName}
                    </span>
                </div>
                <h4 className='text-sm font-semibold mb-1'>{post.title}</h4>
                <p className='text-xs text-gray line-clamp-2'>
                    {post.description}
                </p>
            </div>

            {/* Add comment section */}
            <div>
                <label className='text-sm font-medium'>
                    Add your comment (optional)
                </label>
                <GlobalMarkDownEdit
                    value={comment}
                    setValue={setComment}
                    label=''
                />
            </div>

            <div className='flex justify-end gap-2 pt-2'>
                <Button variant='outline' onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={handleRepost} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <LoadingSpinner /> Reposting...
                        </>
                    ) : (
                        'Repost'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Repost;

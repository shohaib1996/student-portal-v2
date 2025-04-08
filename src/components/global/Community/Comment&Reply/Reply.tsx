import { Button } from '@/components/ui/button';
import { TComment } from '@/types';
import { EllipsisVertical, FilePenLine, Trash2 } from 'lucide-react';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import UpdateReply from './UpdateReply';
import { toast } from 'sonner';
import { IAuthUser } from '@/types';
import { useSelector } from 'react-redux';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleRepliesMutation } from '@/redux/api/audio-video/audioVideos';

const ReplyItem = ({ reply }: { reply: TComment }) => {
    const user: IAuthUser = useSelector((state: any) => state.auth.user);
    const userId = user?._id;

    const [isEditing, setIsEditing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteReply] = useDeleRepliesMutation();

    const handleDelete = async () => {
        try {
            const res = await deleteReply(reply._id);
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
            console.error(error);
        }
    };

    return (
        <>
            {isEditing ? (
                <UpdateReply
                    initialReply={reply}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <div className='relative my-2 flex items-start gap-2'>
                    <div className='absolute -left-5 top-common h-full w-5 border-t-2 border-[#AEAEAE]'></div>
                    <Image
                        className='h-6 w-6 rounded-full'
                        src={
                            reply?.user?.profilePicture ??
                            'https://img.freepik.com/premium-vector/male-character-social-network-concept_24877-17897.jpg?semt=ais_hybrid'
                        }
                        alt='avatar'
                        width={24}
                        height={24}
                        unoptimized
                    />
                    <div className='rounded-xl bg-foreground p-2'>
                        <strong>{reply?.user?.fullName}</strong>
                        <p>{reply.comment}</p>
                    </div>
                    {userId === reply.user._id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='default'
                                    className='bg-background p-0 text-black'
                                >
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-32'>
                                <DropdownMenuItem
                                    className='flex items-center'
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FilePenLine />
                                    Update
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className='text-danger flex items-center'
                                    onClick={() => setIsDialogOpen(true)}
                                >
                                    <Trash2 />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            )}

            {isDialogOpen && (
                <AlertDialog open>
                    <AlertDialogTrigger asChild></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you sure you want to delete this comment?
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
    );
};

export default ReplyItem;

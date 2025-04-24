import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, AlertCircle } from 'lucide-react';
import {
    useGetCourseReviewQuery,
    useUpdateReviewMutation,
    useSubmitReviewMutation,
} from '@/redux/api/course/courseApi';
import { toast } from 'sonner';

// Interfaces
interface ReviewedBy {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profilePicture?: string;
}

interface Review {
    _id: string;
    text: string;
    starCount: number;
    status: string;
    reviewedBy: ReviewedBy;
    createdAt: string;
}

interface ReviewModalProps {
    _id: string;
}

export default function ReviewModal({ _id }: ReviewModalProps) {
    const { data, isLoading, isError } = useGetCourseReviewQuery(_id);
    const [updateReview] = useUpdateReviewMutation();
    const [submitReview] = useSubmitReviewMutation();
    const [isEdit, setIsEdit] = useState(false);
    const [editedText, setEditedText] = useState('');
    const [editedRating, setEditedRating] = useState(0);

    // Only open editor automatically if there's no review
    useEffect(() => {
        if (isError) {
            setIsEdit(true);
        }
    }, [data]);

    const review: Review | undefined = data?.review;
    const formattedDate = review
        ? new Date(review?.createdAt).toLocaleDateString()
        : '';
    const name = review?.reviewedBy?.fullName?.trim() || 'Unknown';
    const avatarSrc =
        review?.reviewedBy?.profilePicture || '/default-avatar.png';

    const handleEditClick = () => {
        if (review) {
            setEditedText(review.text);
            setEditedRating(Math.round(review?.starCount));
        } else {
            // Reset for new review
            setEditedText('');
            setEditedRating(0);
        }
        setIsEdit(true);
    };

    const handleCancel = () => {
        if (review) {
            setEditedText(review?.text);
            setEditedRating(Math.round(review?.starCount));
        } else {
            // Reset for new review
            setEditedText('');
            setEditedRating(0);
        }
        setIsEdit(false);
    };

    const handleSave = () => {
        if (review) {
            // Update existing review
            updateReview({
                reviewId: review?._id,
                body: { starCount: editedRating, text: editedText },
            })
                .unwrap()
                .then(() => {
                    toast.success('Review updated successfully');
                    setIsEdit(false);
                })
                .catch((err) => toast.error('Failed to update review:', err));
        } else {
            // Submit new review
            submitReview({
                course: _id,
                starCount: editedRating,
                text: editedText,
            })
                .unwrap()
                .then(() => {
                    toast.success('Review added successfully');
                    setIsEdit(false);
                })
                .catch((err) => toast.error('Failed to submit review:', err));
        }
    };

    // Determine the rating to display: use editedRating when editing or review's starCount otherwise
    const currentRating = isEdit
        ? editedRating
        : Math.round(review?.starCount || 0);

    console.log({ review });

    return (
        <div className='space-y-4 mt-3'>
            {isLoading ? (
                <div className='text-center py-4'>Loading review...</div>
            ) : (
                <>
                    {(review || isError) && (
                        <>
                            {isError && (
                                <div className='flex items-center bg-yellow-50 p-3 rounded text-yellow-600 mb-4'>
                                    <AlertCircle className='mr-2 h-5 w-5' />
                                    <span>
                                        Please give use review for better
                                        feedback
                                    </span>
                                </div>
                            )}

                            <div className='flex justify-between items-start'>
                                <div className='flex items-center gap-3'>
                                    {!review || isError || (
                                        <Avatar className='border-2 border-primary'>
                                            <AvatarImage
                                                src={avatarSrc}
                                                alt={name}
                                            />
                                            <AvatarFallback>
                                                {name
                                                    ?.slice(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <span className='font-medium text-gray'>
                                        {review ? name : 'Please Give rating'}
                                    </span>
                                </div>
                                <span className='text-sm text-gray'>
                                    {formattedDate}
                                </span>
                            </div>

                            <div className='flex items-center'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        onClick={() =>
                                            isEdit && setEditedRating(star)
                                        }
                                        className={`w-5 h-5 cursor-pointer ${
                                            star <= currentRating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray'
                                        } fill-current`}
                                        xmlns='http://www.w3.org/2000/svg'
                                        viewBox='0 0 24 24'
                                    >
                                        <path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
                                    </svg>
                                ))}
                            </div>

                            <div className='flex justify-between items-center'>
                                <p className='text-gray'>{formattedDate}</p>
                                {review && (
                                    <div className='flex items-center'>
                                        <span className='mr-2'>Status:</span>
                                        <Badge className='bg-primary text-pure-white hover:bg-primary'>
                                            {review?.status ||
                                                (isEdit ? 'New' : 'Pending')}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {isEdit ? (
                                <textarea
                                    className='w-full p-2 border rounded text-gray'
                                    value={editedText}
                                    placeholder={
                                        review
                                            ? 'Edit your review'
                                            : 'Write your review'
                                    }
                                    onChange={(e) =>
                                        setEditedText(e.target.value)
                                    }
                                />
                            ) : (
                                <p className='text-gray'>
                                    {review?.text || 'No review text.'}
                                </p>
                            )}

                            {isEdit ? (
                                <div className='flex gap-2'>
                                    <Button
                                        onClick={handleCancel}
                                        variant={'danger_light'}
                                        size={'sm'}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size={'sm'}
                                        onClick={handleSave}
                                        disabled={
                                            editedRating === 0 ||
                                            editedText.trim() === ''
                                        }
                                        className='bg-primary text-pure-white disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {review ? 'Update' : 'Submit'} Review
                                    </Button>
                                </div>
                            ) : (
                                <Badge
                                    onClick={handleEditClick}
                                    className='bg-primary text-pure-white hover:bg-primary cursor-pointer'
                                >
                                    <Pencil className='h-4 w-4 mr-2' />
                                    {review ? 'Edit Review' : 'Add Review'}
                                </Badge>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

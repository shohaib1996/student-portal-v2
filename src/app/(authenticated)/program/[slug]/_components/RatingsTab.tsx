'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { useAppSelector } from '@/redux/hooks';
import { useSubmitMyReviewMutation } from '@/redux/api/course/courseApi';

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import GlobalMarkDownEdit from '@/components/global/Community/MarkDown/GlobalMarkDownEdit';
import GlobalMarkDownPreview from '@/components/global/Community/MarkDown/GlobalMarkDownPreview';

import { Edit, Save, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
import GlobalEditor from '@/components/editor/GlobalEditor';
import { Badge } from '@/components/ui/badge';

// Helper: Star rating UI component
function StarRating({
    value,
    onChange,
    readOnly = false,
}: {
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
}) {
    const [rating, setRating] = useState(value);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        setRating(value);
    }, [value]);

    const handleClick = (index: number) => {
        if (readOnly) {
            return;
        }
        const newRating = index + 1;
        setRating(newRating);
        onChange?.(newRating);
    };

    return (
        <div className='flex'>
            {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                const filled = starValue <= (hoverRating || rating);
                return (
                    <button
                        key={index}
                        type='button'
                        className={cn(
                            'p-1',
                            readOnly ? 'cursor-default' : 'cursor-pointer',
                        )}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() =>
                            !readOnly && setHoverRating(starValue)
                        }
                        onMouseLeave={() => !readOnly && setHoverRating(0)}
                        disabled={readOnly}
                    >
                        <svg
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill={filled ? '#FFC107' : 'none'}
                            xmlns='http://www.w3.org/2000/svg'
                            className={
                                filled ? 'text-yellow-400' : 'text-gray-300'
                            }
                        >
                            <path
                                d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}

// Helper: Convert numeric rating to label
const getRatingLabel = (rating: number) => {
    switch (rating) {
        case 5:
            return 'Excellent';
        case 4:
            return 'Very Good';
        case 3:
            return 'Good';
        case 2:
            return 'Fair';
        case 1:
            return 'Poor';
        default:
            return '';
    }
};

interface RatingsTabProps {
    myReview: any;
    chapterId: string;
}

const RatingsTab: React.FC<RatingsTabProps> = ({ myReview, chapterId }) => {
    const { user } = useAppSelector((state) => state.auth);
    const [submitReview] = useSubmitMyReviewMutation();

    // Local state
    const [newReview, setNewReview] = useState(myReview);
    const [feedbackText, setFeedbackText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    // Star ratings state
    const [videoStarCount, setVideoStarCount] = useState(0);
    const [knowledgeStarCount, setKnowledgeStarCount] = useState(0);
    const [expressionStarCount, setExpressionStarCount] = useState(0);
    const [interactionStarCount, setInteractionStarCount] = useState(0);
    const [overallStarCount, setOverallStarCount] = useState(0);

    // Initialize form values when review changes
    useEffect(() => {
        if (newReview) {
            setFeedbackText(newReview.feedback || '');
            setVideoStarCount(newReview.additionalCount?.videoStarCount || 0);
            setKnowledgeStarCount(
                newReview.additionalCount?.KnowledgeDepthOfInstructor || 0,
            );
            setExpressionStarCount(
                newReview.additionalCount?.expressionCapabilityStarCount || 0,
            );
            setInteractionStarCount(
                newReview.additionalCount?.interactionStarCount || 0,
            );
            setOverallStarCount(newReview.overallstarCount || 0);
        }
    }, [newReview]);

    // Toggle between edit and view modes
    const toggleEditing = () => {
        setFeedbackText(newReview.feedback || '');
        setVideoStarCount(newReview.additionalCount?.videoStarCount || 0);
        setKnowledgeStarCount(
            newReview.additionalCount?.KnowledgeDepthOfInstructor || 0,
        );
        setExpressionStarCount(
            newReview.additionalCount?.expressionCapabilityStarCount || 0,
        );
        setInteractionStarCount(
            newReview.additionalCount?.interactionStarCount || 0,
        );
        setOverallStarCount(newReview.overallstarCount || 0);
        setIsEditing((prev) => !prev);
    };

    // Submit or update the review
    const handleSubmitReview = async () => {
        // Validation
        if (
            !videoStarCount ||
            !knowledgeStarCount ||
            !expressionStarCount ||
            !interactionStarCount ||
            !overallStarCount
        ) {
            toast.error('Please provide all ratings');
            return;
        }
        if (!feedbackText.trim()) {
            toast.error('Please provide your feedback');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                action: 'submit',
                feedback: feedbackText,
                overallstarCount: overallStarCount,
                additionalCount: {
                    KnowledgeDepthOfInstructor: knowledgeStarCount,
                    videoStarCount,
                    expressionCapabilityStarCount: expressionStarCount,
                    interactionStarCount,
                },
                chapter: chapterId,
            };

            if (newReview?._id) {
                payload.reviewId = newReview._id;
            }

            const response = await submitReview(payload).unwrap();
            setNewReview(response.review);
            toast.success(
                newReview
                    ? 'Review updated successfully!'
                    : 'Review submitted successfully!',
            );

            if (newReview) {
                setIsEditing(false);
            } else {
                setFeedbackText('');
                setVideoStarCount(0);
                setKnowledgeStarCount(0);
                setExpressionStarCount(0);
                setInteractionStarCount(0);
                setOverallStarCount(0);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete existing review
    const handleDeleteReview = async () => {
        setIsSubmitting(true);
        try {
            const response = await submitReview({
                action: 'remove',
                chapter: chapterId,
            }).unwrap();
            setNewReview(null);

            toast.success('Review deleted successfully!');

            setFeedbackText('');
            setVideoStarCount(0);
            setKnowledgeStarCount(0);
            setExpressionStarCount(0);
            setInteractionStarCount(0);
            setOverallStarCount(0);
        } catch (error: any) {
            toast.error(error.data?.error || 'Failed to delete review');
        } finally {
            setIsSubmitting(false);
        }
    };

    console.log({ feedbackText });
    return (
        <>
            <div className='py-2'>
                <div className='border border-border rounded-md p-2'>
                    <div className='flex justify-between items-center mb-2'>
                        <div>
                            <h2 className='text-xl font-medium text-black'>
                                {newReview ? 'My Review' : 'Share Experience'}
                            </h2>
                            <p className='text-sm text-gray'>
                                {newReview
                                    ? 'Your feedback for this course'
                                    : 'Help others by rating this course'}
                            </p>
                        </div>
                        {newReview ? (
                            <div>
                                {isEditing ? (
                                    <Button size='sm' onClick={toggleEditing}>
                                        <X className='w-4 h-4' />
                                        Cancel
                                    </Button>
                                ) : (
                                    <div className='gap-2 flex '>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={toggleEditing}
                                        >
                                            {' '}
                                            <Edit className='w-4 h-4' />
                                            Edit
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant={'danger_light'}
                                            onClick={() => setOpen(true)}
                                        >
                                            <Trash className='w-4 h-4' />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button
                                variant='default'
                                onClick={handleSubmitReview}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        )}
                    </div>

                    {/* Review Form */}
                    {(!newReview || isEditing) && (
                        <>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2'>
                                {/* Video Content */}
                                <div className='border border-border rounded-md p-2 bg-background flex flex-row md:flex-col lg:flex-row justify-between items-center md:items-start lg:items-center'>
                                    <div>
                                        <div className='flex items-center gap-1'>
                                            <svg
                                                width='20'
                                                height='20'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            <span className='font-medium'>
                                                Video Content
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <StarRating
                                                value={videoStarCount}
                                                onChange={(val) =>
                                                    setVideoStarCount(val)
                                                }
                                            />
                                        </div>
                                    </div>
                                    {/* {videoStarCount > 0 && (
                                        <span className='ml-2 text-xs py-1 px-2 bg-primary text-white rounded-full'>
                                            {getRatingLabel(videoStarCount)}
                                        </span>
                                    )} */}
                                </div>

                                {/* Knowledge depth of Mentor */}
                                <div className='border border-border rounded-md p-2 bg-background flex flex-row md:flex-col lg:flex-row justify-between items-center md:items-start lg:items-center'>
                                    <div>
                                        <div className='flex items-center gap-1'>
                                            <svg
                                                width='20'
                                                height='20'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            <span className='font-medium'>
                                                Knowledge depth of Mentor
                                            </span>
                                        </div>
                                        <StarRating
                                            value={knowledgeStarCount}
                                            onChange={(val) =>
                                                setKnowledgeStarCount(val)
                                            }
                                        />
                                    </div>
                                    {knowledgeStarCount > 0 && (
                                        <span className='ml-2 text-xs py-1 px-2 bg-primary text-white rounded-full'>
                                            {getRatingLabel(knowledgeStarCount)}
                                        </span>
                                    )}
                                </div>

                                {/* Expression Capability */}
                                <div className='border border-border rounded-md p-2 bg-background flex flex-row md:flex-col lg:flex-row justify-between items-center md:items-start lg:items-center'>
                                    <div>
                                        <div className='flex items-center gap-1'>
                                            <svg
                                                width='20'
                                                height='20'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            <span className='font-medium'>
                                                Expression Capability
                                            </span>
                                        </div>
                                        <StarRating
                                            value={expressionStarCount}
                                            onChange={(val) =>
                                                setExpressionStarCount(val)
                                            }
                                        />
                                    </div>
                                    {expressionStarCount > 0 && (
                                        <span className='ml-2 text-xs py-1 px-2 bg-primary text-white rounded-full'>
                                            {getRatingLabel(
                                                expressionStarCount,
                                            )}
                                        </span>
                                    )}
                                </div>

                                {/* Interaction */}
                                <div className='border border-border rounded-md p-2 bg-background flex flex-row md:flex-col lg:flex-row justify-between items-center md:items-start lg:items-center'>
                                    <div>
                                        <div className='flex items-center gap-1'>
                                            <svg
                                                width='20'
                                                height='20'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M17 20L12 15L7 20M7 4L12 9L17 4'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            <span className='font-medium'>
                                                Interaction
                                            </span>
                                        </div>
                                        <StarRating
                                            value={interactionStarCount}
                                            onChange={(val) =>
                                                setInteractionStarCount(val)
                                            }
                                        />
                                    </div>
                                    {interactionStarCount > 0 && (
                                        <span className='ml-2 text-xs py-1 px-2 bg-primary text-white rounded-full'>
                                            {getRatingLabel(
                                                interactionStarCount,
                                            )}
                                        </span>
                                    )}
                                </div>

                                {/* Overall Experience */}
                                <div className='border border-border rounded-md p-2 bg-background flex flex-row md:flex-col lg:flex-row justify-between items-center md:items-start lg:items-center'>
                                    <div>
                                        <div className='flex items-center gap-1'>
                                            <svg
                                                width='20'
                                                height='20'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M12 5V3M12 21V19M5 12H3M21 12H19M18.364 18.364L16.95 16.95M18.364 5.636L16.95 7.05M5.636 5.636L7.05 7.05M5.636 18.364L7.05 16.95'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            <span className='font-medium'>
                                                Overall Experience
                                            </span>
                                        </div>
                                        <StarRating
                                            value={overallStarCount}
                                            onChange={(val) =>
                                                setOverallStarCount(val)
                                            }
                                        />
                                    </div>
                                    {overallStarCount > 0 && (
                                        <span className='ml-2 text-xs py-1 px-2 bg-primary text-white rounded-full'>
                                            {getRatingLabel(overallStarCount)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Feedback Section */}
                            <div className='mb-2'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <svg
                                        width='20'
                                        height='20'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <span className='font-medium'>
                                        Your Feedback
                                    </span>
                                </div>
                                {/* <GlobalBlockEditor
                                    value={feedbackText || ''}
                                    onChange={(val) => setFeedbackText(val)}
                                    className='min-h-[calc(100vh-300px)]'
                                /> */}
                                <GlobalEditor
                                    className='bg-foreground border-border-primary-light'
                                    placeholder='Write Task details'
                                    value={feedbackText || ''}
                                    onChange={(val) => setFeedbackText(val)}
                                    autoFocus={false}
                                />
                            </div>

                            {/* Submit/Update Button for Edit Mode */}
                            {newReview && isEditing && (
                                <div className='flex justify-end'>
                                    <Button
                                        variant='default'
                                        onClick={handleSubmitReview}
                                        disabled={isSubmitting}
                                        className='flex items-center gap-1'
                                    >
                                        <Save className='w-4 h-4' />
                                        {isSubmitting
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {/* View Mode - Only shown when newReview exists and not in edit mode */}
                    {newReview && !isEditing && (
                        <div className='bg-muted/30 rounded-lg p-4'>
                            <div className='flex items-center gap-3 mb-3'>
                                <Avatar>
                                    <AvatarImage
                                        src={user?.profilePicture}
                                        alt={user?.fullName || 'User'}
                                    />
                                    <AvatarFallback>
                                        {user?.fullName || 'User'}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <div className='font-medium text-black'>
                                        {user?.fullName || 'You'}
                                    </div>
                                    <div className='text-xs text-muted-foreground flex items-center gap-2'>
                                        <span>
                                            {(user as any)?.role || 'Student'}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {new Date(
                                                newReview?.createdAt,
                                            ).toLocaleDateString()}{' '}
                                            at{' '}
                                            {new Date(
                                                newReview?.createdAt,
                                            ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='grid  xl:grid-cols-4 md:grid-cols-4 grid-cols-2 gap-4 mb-3'>
                                <div className='bg-background rounded-md col-span-2 p-2 flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M12 5V3M12 21V19M5 12H3M21 12H19M18.364 18.364L16.95 16.95M18.364 5.636L16.95 7.05M5.636 5.636L7.05 7.05M5.636 18.364L7.05 16.95'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <div className='w-full'>
                                        <div className='text-xs font-medium flex justify-between'>
                                            Overall
                                            <p>
                                                <Badge className='px-1 py-0 text-[9px] font-medium rounded-full'>
                                                    {getRatingLabel(
                                                        newReview?.overallstarCount ||
                                                            0,
                                                    )}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    newReview?.overallstarCount ||
                                                    0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background rounded-md col-span-2 p-2 flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <div className='w-full'>
                                        <div className='text-xs font-medium flex justify-between'>
                                            Video
                                            <Badge className=' px-1 py-0 text-[9px] font-medium rounded-full'>
                                                {getRatingLabel(
                                                    newReview?.additionalCount
                                                        ?.videoStarCount || 0,
                                                )}
                                            </Badge>
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    newReview?.additionalCount
                                                        ?.videoStarCount || 0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background rounded-md col-span-2 p-2 flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <div className='w-full'>
                                        <div className='text-xs font-medium flex justify-between'>
                                            Knowledge
                                            <Badge className=' px-1 py-0 text-[9px] font-medium rounded-full'>
                                                {getRatingLabel(
                                                    newReview?.additionalCount
                                                        ?.KnowledgeDepthOfInstructor ||
                                                        0,
                                                )}
                                            </Badge>
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    newReview?.additionalCount
                                                        ?.KnowledgeDepthOfInstructor ||
                                                    0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background rounded-md col-span-2 p-2 flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <div className='w-full'>
                                        <div className='text-xs font-medium flex justify-between'>
                                            Expression
                                            <Badge className=' px-1 py-0 text-[9px] font-medium rounded-full'>
                                                {getRatingLabel(
                                                    newReview?.additionalCount
                                                        ?.expressionCapabilityStarCount ||
                                                        0,
                                                )}
                                            </Badge>
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    newReview?.additionalCount
                                                        ?.expressionCapabilityStarCount ||
                                                    0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background col-span-full rounded-md p-2 flex items-center gap-2'>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                            d='M17 20L12 15L7 20M7 4L12 9L17 4'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <div className='w-full'>
                                        <div className='text-xs font-medium flex justify-between'>
                                            Interaction
                                            <Badge className=' px-1 py-0 text-[9px] font-medium rounded-full'>
                                                {getRatingLabel(
                                                    newReview?.additionalCount
                                                        ?.interactionStarCount ||
                                                        0,
                                                )}
                                            </Badge>
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    newReview?.additionalCount
                                                        ?.interactionStarCount ||
                                                    0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='bg-background rounded-md p-3 mt-3'>
                                <h3 className='text-sm font-medium mb-2'>
                                    Feedback
                                </h3>

                                <GlobalMarkDownPreview
                                    className='text-sm text-muted-foreground whitespace-pre-line'
                                    text={
                                        newReview?.feedback ||
                                        'No feedback provided.'
                                    }
                                ></GlobalMarkDownPreview>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <>
                {/* {open && <div className="fixed inset-0 bg-red-400/50 z-50" aria-hidden="true" />} */}
                <AlertDialog open={open} onOpenChange={setOpen}>
                    {/* <AlertDialogTrigger asChild></AlertDialogTrigger> */}
                    <AlertDialogContent className='z-[99999]'>
                        <AlertDialogHeader>
                            <AlertDialogTitle className='text-center text-red'>
                                {'Are you absolutely sure?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription className='text-center'>
                                {
                                    'This action cannot be undone. This will permanently delete your item and remove your data from our servers.'
                                }
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className='flex w-full justify-center'>
                            <AlertDialogFooter>
                                <AlertDialogCancel className='bg-primary text-pure-white hover:bg-primary hover:text-pure-white'>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    className='bg-danger/20 hover:bg-danger/25 text-danger '
                                    onClick={handleDeleteReview}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        </>
    );
};

export default RatingsTab;

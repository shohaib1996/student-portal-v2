'use client';
import GlobalMarkDownEdit from '@/components/global/Community/MarkDown/GlobalMarkDownEdit';
import GlobalMarkDownPreview from '@/components/global/Community/MarkDown/GlobalMarkDownPreview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSubmitMyReviewMutation } from '@/redux/api/course/courseApi';
import { useAppSelector } from '@/redux/hooks';
import { Edit, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const RatingsTab = ({
    myReview,
    chapterId,
}: {
    myReview: any;
    chapterId: string;
}) => {
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useAppSelector((state) => state?.auth);
    // Add state for all star ratings
    const [videoStarCount, setVideoStarCount] = useState(0);
    const [knowledgeStarCount, setKnowledgeStarCount] = useState(0);
    const [expressionStarCount, setExpressionStarCount] = useState(0);
    const [interactionStarCount, setInteractionStarCount] = useState(0);
    const [overallStarCount, setOverallStarCount] = useState(0);

    // Add loading state for submission
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [submitReview] = useSubmitMyReviewMutation();

    // Initialize form with existing review data if available
    useEffect(() => {
        if (myReview) {
            setFeedbackText(myReview?.feedback || '');
            setVideoStarCount(myReview?.additionalCount?.videoStarCount || 0);
            setKnowledgeStarCount(
                myReview?.additionalCount?.KnowledgeDepthOfInstructor || 0,
            );
            setExpressionStarCount(
                myReview?.additionalCount?.expressionCapabilityStarCount || 0,
            );
            setInteractionStarCount(
                myReview?.additionalCount?.interactionStarCount || 0,
            );
            setOverallStarCount(myReview?.overallstarCount || 0);
        }
    }, [myReview]);

    // Toggle edit mode
    const toggleEditing = () => {
        setIsEditing(!isEditing);
    };

    const handleSubmitReview = async () => {
        // Validate if all star ratings are provided
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

        // Validate if feedback is provided
        if (!feedbackText.trim()) {
            toast.error('Please provide your feedback');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare the data according to the required format
            const data = {
                action: myReview ? 'update' : 'submit',
                feedback: feedbackText,
                overallstarCount: overallStarCount,
                additionalCount: {
                    KnowledgeDepthOfInstructor: knowledgeStarCount,
                    videoStarCount: videoStarCount,
                    expressionCapabilityStarCount: expressionStarCount,
                    interactionStarCount: interactionStarCount,
                },
                chapter: chapterId || '', // Use the provided chapter ID
                ...(myReview && { reviewId: myReview?._id || '' }),
            };

            // Submit the review
            const response = await submitReview(data).unwrap();

            // Show success message
            toast.success(
                myReview
                    ? 'Review updated successfully!'
                    : 'Review submitted successfully!',
            );

            // Reset edit mode if updating
            if (myReview) {
                setIsEditing(false);
            } else {
                // Reset form after successful submission of new review
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

        // Update internal rating when value prop changes
        useEffect(() => {
            setRating(value);
        }, [value]);

        const handleClick = (index: number) => {
            if (readOnly) {
                return;
            }
            const newRating = index + 1;
            setRating(newRating);
            if (onChange) {
                onChange(newRating);
            }
        };

        return (
            <div className='flex'>
                {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                        <button
                            key={index}
                            type='button'
                            className={`p-1 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
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
                                fill={
                                    starValue <= (hoverRating || rating)
                                        ? '#FFC107'
                                        : 'none'
                                }
                                xmlns='http://www.w3.org/2000/svg'
                                className={`${starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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

    // Helper function to get rating label based on star count
    const getRatingLabel = (rating: number) => {
        if (rating === 5) {
            return 'Excellent';
        }
        if (rating === 4) {
            return 'Very Good';
        }
        if (rating === 3) {
            return 'Good';
        }
        if (rating === 2) {
            return 'Fair';
        }
        if (rating === 1) {
            return 'Poor';
        }
        return '';
    };

    return (
        <>
            <div className='py-2'>
                <div className='border border-border rounded-md p-2'>
                    <div className='flex justify-between items-center mb-2'>
                        <div>
                            <h2 className='text-xl font-medium text-black'>
                                {myReview ? 'My Review' : 'Share Experience'}
                            </h2>
                            <p className='text-sm text-gray'>
                                {myReview
                                    ? 'Your feedback for this course'
                                    : 'Help others by rating this course'}
                            </p>
                        </div>
                        {myReview ? (
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={toggleEditing}
                                className='flex items-center gap-1'
                            >
                                {isEditing ? (
                                    <>
                                        <X className='w-4 h-4' />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <Edit className='w-4 h-4' />
                                        Edit Review
                                    </>
                                )}
                            </Button>
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
                    {(!myReview || isEditing) && (
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
                                    {videoStarCount > 0 && (
                                        <span className='ml-2 text-xs py-1 px-2 bg-primary text-white rounded-full'>
                                            {getRatingLabel(videoStarCount)}
                                        </span>
                                    )}
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
                                <GlobalMarkDownEdit
                                    setValue={setFeedbackText}
                                    value={feedbackText}
                                ></GlobalMarkDownEdit>
                            </div>

                            {/* Submit/Update Button for Edit Mode */}
                            {myReview && isEditing && (
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

                    {/* View Mode - Only shown when myReview exists and not in edit mode */}
                    {myReview && !isEditing && (
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
                                                myReview?.createdAt,
                                            ).toLocaleDateString()}{' '}
                                            at{' '}
                                            {new Date(
                                                myReview?.createdAt,
                                            ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-wrap gap-4 mb-3'>
                                <div className='bg-background rounded-md p-2 flex items-center gap-2'>
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
                                    <div>
                                        <div className='text-xs font-medium'>
                                            Overall
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    myReview?.overallstarCount ||
                                                    0
                                                }
                                                readOnly={true}
                                            />
                                            <span className='ml-1 text-xs font-medium'>
                                                {getRatingLabel(
                                                    myReview?.overallstarCount ||
                                                        0,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background rounded-md p-2 flex items-center gap-2'>
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
                                    <div>
                                        <div className='text-xs font-medium'>
                                            Video
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    myReview?.additionalCount
                                                        ?.videoStarCount || 0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background rounded-md p-2 flex items-center gap-2'>
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
                                    <div>
                                        <div className='text-xs font-medium'>
                                            Knowledge
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    myReview?.additionalCount
                                                        ?.KnowledgeDepthOfInstructor ||
                                                    0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background rounded-md p-2 flex items-center gap-2'>
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
                                    <div>
                                        <div className='text-xs font-medium'>
                                            Expression
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    myReview?.additionalCount
                                                        ?.expressionCapabilityStarCount ||
                                                    0
                                                }
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-background rounded-md p-2 flex items-center gap-2'>
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
                                    <div>
                                        <div className='text-xs font-medium'>
                                            Interaction
                                        </div>
                                        <div className='flex items-center'>
                                            <StarRating
                                                value={
                                                    myReview?.additionalCount
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
                                        myReview?.feedback ||
                                        'No feedback provided.'
                                    }
                                ></GlobalMarkDownPreview>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RatingsTab;

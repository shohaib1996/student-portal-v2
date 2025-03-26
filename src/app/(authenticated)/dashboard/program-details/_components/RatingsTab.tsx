import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

const RatingsTab = () => {
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const commingSoon = () => {
        toast.success('Coming Soon...');
    };

    // Reviews data
    const reviews = [
        {
            id: 1,
            name: 'Angel Cruz',
            avatar: '/images/author.png',
            role: 'Students',
            rating: 5,
            date: 'Jan 30, 2025',
            time: '12:30 PM',
            content:
                "I'll admit it's extravagant in terms of the price and not as functionally faultless as the iconic brand name would have you believe. But it does keep time, it holds its value better than virtually any stock investment over the past year and, moreover, it's an ingeniously (if paradoxically) subtle creation on the part of the renowned manufacturer.",
        },
        {
            id: 2,
            name: 'Brooklyn Simmons',
            avatar: '/images/author.png',
            role: 'Students',
            rating: 5,
            date: 'Jun 30, 2024',
            time: '12:30 PM',
            content:
                "I'll admit it's extravagant in terms of the price and not as functionally faultless as the iconic brand name would have you believe. But it does keep time, it holds its value better than virtually any stock investment over the past year and, moreover, it's an ingeniously (if paradoxically) subtle creation on the part of the renowned manufacturer.",
        },
        {
            id: 3,
            name: 'Robert Johnson',
            avatar: '/images/author.png',
            role: 'Students',
            rating: 4,
            date: 'May 15, 2024',
            time: '09:45 AM',
            content:
                "I'll admit it's extravagant in terms of the price and not as functionally faultless as the iconic brand name would have you believe. But it does keep time, it holds its value better than virtually any stock investment over the past year and, moreover, it's an ingeniously (if paradoxically) subtle creation on the part of the renowned manufacturer.",
        },
    ];

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

        const handleClick = (index: number) => {
            if (readOnly) {
                return;
            }
            const newRating = index + 1;
            setRating(newRating);
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

    return (
        <div className='py-2'>
            <div className='border border-border rounded-md p-2'>
                <div className='flex justify-between items-center mb-2'>
                    <div>
                        <h2 className='text-xl font-medium text-black'>
                            Share Experience
                        </h2>
                        <p className='text-sm text-gray'>
                            Help others by rating this course
                        </p>
                    </div>
                    <Button variant='default' onClick={commingSoon}>
                        Submit
                    </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-2 mb-2'>
                    {/* Video Content */}
                    <div className='border border-border rounded-md p-2 bg-background flex justify-between items-center'>
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
                                    value={3}
                                    onChange={(val) =>
                                        console.log(
                                            'Video Content rating:',
                                            val,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <span className='ml-2 text-xs py-1 px-2 bg-primary text-white rounded-full'>
                            Excellent
                        </span>
                    </div>

                    {/* Knowledge depth of Mentor */}
                    <div className='border border-border rounded-md p-2 bg-background'>
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
                            value={0}
                            onChange={(val) =>
                                console.log('Knowledge rating:', val)
                            }
                        />
                    </div>

                    {/* Expression Capability */}
                    <div className='border border-border rounded-md p-2 bg-background'>
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
                            value={0}
                            onChange={(val) =>
                                console.log('Expression rating:', val)
                            }
                        />
                    </div>

                    {/* Interaction */}
                    <div className='border border-border rounded-md p-2 bg-background'>
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
                            <span className='font-medium'>Interaction</span>
                        </div>
                        <StarRating
                            value={0}
                            onChange={(val) =>
                                console.log('Interaction rating:', val)
                            }
                        />
                    </div>

                    {/* Overall Experience */}
                    <div className='border border-border rounded-md p-2 bg-background'>
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
                            value={0}
                            onChange={(val) =>
                                console.log('Overall rating:', val)
                            }
                        />
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
                        <span className='font-medium'>Your Feedback</span>
                    </div>
                    <textarea
                        className='w-full bg-background border border-border rounded-md p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Share your thought about this course...'
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                    ></textarea>
                </div>

                {/* All Reviews Section */}
                <div>
                    <h3 className='text-base font-medium text-black my-1'>
                        All Reviews
                    </h3>
                    <div className='space-y-2'>
                        {reviews
                            .slice(0, showAllReviews ? reviews.length : 2)
                            .map((review) => (
                                <div
                                    key={review.id}
                                    className='border-t border-border pt-2'
                                >
                                    <div className='flex items-center gap-2 mb-2'>
                                        <div className='w-8 h-8 rounded-full overflow-hidden'>
                                            <Image
                                                src={
                                                    review.avatar ||
                                                    '/placeholder.svg'
                                                }
                                                alt={review.name}
                                                width={32}
                                                height={32}
                                                className='object-cover'
                                            />
                                        </div>
                                        <div>
                                            <div className='font-medium text-black'>
                                                {review.name}
                                            </div>
                                            <div className='text-xs text-gray'>
                                                {review.role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-1 text-sm'>
                                        <StarRating
                                            value={review.rating}
                                            readOnly={true}
                                        />
                                        <span className='text-dark-gray'>
                                            {review.date} | {review.time}
                                        </span>
                                    </div>

                                    <p className='text-sm text-dark-gray'>
                                        {review.content}
                                    </p>
                                </div>
                            ))}
                    </div>

                    {reviews.length > 2 && (
                        <div className='flex items-center w-full px-2'>
                            <div className='h-px bg-border flex-grow'></div>
                            <Button
                                onClick={() =>
                                    setShowAllReviews(!showAllReviews)
                                }
                                variant='outline'
                                size='sm'
                                className='mx-4 rounded-full px-4 bg-primary-light text-primary border-border-primary-light hover:bg-primary-light hover:text-primary'
                            >
                                {showAllReviews ? 'Show Less' : 'View More'}
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${showAllReviews ? 'rotate-180' : ''}`}
                                />
                            </Button>
                            <div className='h-px bg-border flex-grow'></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingsTab;

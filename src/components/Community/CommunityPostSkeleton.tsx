import { Card, CardContent, CardTitle } from '@/components/ui/card';

const CommunityPostSkeleton = () => {
    return (
        <Card className='mb-common-multiplied p-common-multiplied'>
            <CardTitle>
                <div className='flex justify-between'>
                    <div className='flex items-center gap-common'>
                        {/* Profile Picture Skeleton */}
                        <div className='h-12 w-12 animate-pulse rounded-full bg-gray-300'></div>

                        <div>
                            {/* Name and Time Skeleton */}
                            <div className='flex flex-col'>
                                <div className='mb-2 h-4 w-32 animate-pulse bg-gray-300'></div>{' '}
                                {/* Name Skeleton */}
                                <div className='h-3 w-16 animate-pulse bg-gray-300'></div>{' '}
                                {/* Time Skeleton */}
                            </div>

                            {/* Date Skeleton */}
                            <div className='mt-2 h-3 w-24 animate-pulse bg-gray-300'></div>
                        </div>
                    </div>

                    {/* Options Button Skeleton */}
                    <div className='h-6 w-6 animate-pulse rounded-full bg-gray-300'></div>
                </div>
            </CardTitle>

            <CardContent className='relative'>
                {/* Post Title Skeleton */}
                <div className='mb-4 mt-common-multiplied h-6 w-3/4 animate-pulse bg-gray-300'></div>

                {/* Post Description Skeleton */}
                <div className='mb-4 h-24 w-full animate-pulse bg-gray-300'></div>

                {/* See More Button Skeleton */}
            </CardContent>
        </Card>
    );
};

export default CommunityPostSkeleton;

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TopContributorsSkeleton = () => {
    return (
        <Card className='overflow-hidden border-border bg-gray shadow-sm'>
            <CardHeader className='bg-gray pb-3 pt-4 px-4'>
                <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='p-0'>
                <div className='divide-y divide-gray'>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className='flex items-center gap-3 px-4 py-3'
                        >
                            <Skeleton className='h-10 w-10 rounded-full' />
                            <div className='flex-1'>
                                <Skeleton className='h-4 w-24 mb-2' />
                                <Skeleton className='h-3 w-48' />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TopContributorsSkeleton;

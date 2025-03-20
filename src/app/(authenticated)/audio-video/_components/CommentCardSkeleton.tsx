import { Skeleton } from '@/components/ui/skeleton';

export default function CommentCardSkeleton() {
    return (
        <div className='border-b border-gray-300 p-4'>
            <div className='flex items-start gap-2'>
                <Skeleton className='via-primary-from-primary to-custom-from-primary h-8 w-8 rounded-full bg-gradient-to-r from-primary' />
                <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                        <div>
                            <Skeleton className='via-primary-from-primary to-custom-from-primary mb-1 h-4 w-32 bg-gradient-to-r from-primary' />
                            <Skeleton className='via-primary-from-primary to-custom-from-primary h-6 w-24 bg-gradient-to-r from-primary' />
                        </div>
                        <Skeleton className='via-primary-primary-from-primary to-custom-from-primary h-6 w-6 rounded-full bg-gradient-to-r from-primary' />
                    </div>
                    <Skeleton className='via-primary-from-primary to-custom-from-primary mt-2 h-4 w-full bg-gradient-to-r from-primary' />
                    <Skeleton className='via-primary-from-primary to-custom-from-primary w-6/4 mt-1 h-4 bg-gradient-to-r from-primary' />
                    <div className='mt-4 flex items-center gap-2'>
                        <Skeleton className='via-primary-from-primary to-custom-from-primary h-6 w-20 bg-gradient-to-r from-primary' />
                    </div>
                </div>
            </div>
        </div>
    );
}

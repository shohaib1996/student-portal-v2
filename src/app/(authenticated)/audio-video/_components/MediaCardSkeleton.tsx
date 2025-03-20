import { Skeleton } from '@/components/ui/skeleton';

const MediaCardSkeleton = () => {
    return (
        <div className='rounded-[10px] shadow-md'>
            <div className='relative'>
                <Skeleton className='min-h-[270px] w-full rounded-[10px]' />

                <div className='absolute left-[35%] top-[20%]'>
                    <Skeleton className='h-20 w-20 rounded-full' />
                </div>

                <div className='absolute left-[10%] top-[60%] w-[80%] rounded-[12px] border border-[#E5E5E5] bg-[#ffffff1a] p-4 backdrop-blur-md'>
                    <Skeleton className='mb-2 h-6 w-[70%]' />
                    <Skeleton className='h-4 w-[50%]' />
                </div>
            </div>
        </div>
    );
};

export default MediaCardSkeleton;

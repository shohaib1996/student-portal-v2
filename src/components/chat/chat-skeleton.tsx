import { Star, Bell, Loader, Loader2 } from 'lucide-react';

export function ChatSkeleton() {
    return (
        <div className='flex items-center justify-between p-3 bg-background rounded-md cursor-pointer'>
            <div className='flex items-center gap-4'>
                {/* Avatar skeleton */}
                <div className='w-8 h-8 rounded-full bg-foreground flex items-center justify-center '>
                    <div className='text-gray text-sm'>
                        <Loader2 className='animate-spin' />
                    </div>
                </div>

                {/* Content skeleton */}
                <div className='flex flex-col'>
                    <div className='h-4 w-32 bg-foreground rounded animate-pulse'></div>
                    <div className='h-3 w-20 bg-foreground rounded mt-1 animate-pulse'></div>
                </div>
            </div>

            {/* Date skeleton */}
            <div className='h-3 w-16 bg-foreground rounded animate-pulse'></div>
        </div>
    );
}

export function ChatSkeletonList({ count = 10 }: { count?: number }) {
    return (
        <div className='space-y-2'>
            {Array.from({ length: count }, (_, i) => (
                <ChatSkeleton key={i} />
            ))}
        </div>
    );
}

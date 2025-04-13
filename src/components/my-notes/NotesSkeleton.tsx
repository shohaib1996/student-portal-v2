import { cn } from '@/lib/utils';

export default function NotesSkeleton() {
    return (
        <div className='flex h-full w-full'>
            {/* Left sidebar */}
            <div className='w-full max-w-[400px] border-r border-slate-200 p-4'>
                {/* Header */}
                <div className='mb-4 flex items-center justify-between'>
                    <div className='h-6 w-32 animate-skeleton rounded-md bg-background'></div>
                </div>

                {/* Note card skeleton */}
                <div className='space-y-2 overflow-y-auto h-[calc(100%-32px)]'>
                    {Array.from({ length: 8 }, (_, i) => {
                        return (
                            <div
                                key={i}
                                className={cn(
                                    'overflow-hidden rounded-lg bg-background p-4 text-white',
                                )}
                            >
                                <div className='mb-2 flex items-center justify-between'>
                                    <div
                                        className={cn(
                                            'h-5 w-24 animate-skeleton rounded-md bg-foreground',
                                        )}
                                    ></div>
                                    <div className='flex items-center text-xs text-blue-200'>
                                        <div className='h-3 w-28 animate-skeleton rounded-md bg-foreground'></div>
                                    </div>
                                </div>
                                <div className='mb-4 h-4 w-3/4 animate-skeleton rounded-md bg-foreground'></div>
                                <div className='flex items-center'>
                                    <div className='ml-1 h-3 w-4 animate-skeleton rounded-md bg-foreground'></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right content area */}
            <div className='flex-1 p-6'>
                <div className='mb-6 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='h-7 w-40 animate-skeleton rounded-md bg-background'></div>
                        <div className='h-5 w-5 animate-skeleton rounded-full bg-background'></div>
                    </div>
                    <div className='flex gap-2'>
                        <div className='h-9 w-20 animate-skeleton rounded-md bg-background'></div>
                        <div className='h-9 w-20 animate-skeleton rounded-md bg-background'></div>
                    </div>
                </div>

                <div className='mb-4 flex items-center gap-2 text-sm text-slate-500'>
                    <div className='h-4 w-36 animate-skeleton rounded-md bg-background'></div>
                </div>

                {/* Note content skeletons */}
                <div className='mb-3 h-5 w-full max-w-md animate-skeleton rounded-md bg-background'></div>
                <div className='mb-3 h-5 w-full max-w-lg animate-skeleton rounded-md bg-background'></div>
                <div className='mb-3 h-5 w-full max-w-sm animate-skeleton rounded-md bg-background'></div>
                <div className='h-5 w-full max-w-md animate-skeleton rounded-md bg-background'></div>
            </div>
        </div>
    );
}

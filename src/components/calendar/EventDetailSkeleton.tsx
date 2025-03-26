'use client';
import { Card, CardContent } from '@/components/ui/card';

export default function EventDetailsSkeleton() {
    return (
        <div className='w-full mx-auto'>
            {/* Header with title and action buttons */}
            <div className='mt-2 space-y-4'>
                {/* Date and time */}
                <div className='h-5 w-3/4 bg-muted rounded-md'></div>

                {/* Google Meet button */}
                <div className='flex items-center gap-2'>
                    <div className='h-10 w-10 bg-muted rounded-md'></div>
                    <div className='h-5 w-48 bg-muted rounded-md'></div>
                </div>

                {/* Invited guests */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='h-8 w-8 bg-muted rounded-full'></div>
                        <div className='h-5 w-32 bg-muted rounded-md'></div>
                    </div>
                    <div className='h-5 w-5 bg-muted rounded-md'></div>
                </div>

                {/* Guest status */}
                <div className='flex gap-4 ml-10'>
                    <div className='h-4 w-24 bg-muted rounded-md'></div>
                    <div className='h-4 w-24 bg-muted rounded-md'></div>
                    <div className='h-4 w-24 bg-muted rounded-md'></div>
                </div>

                {/* Reminder */}
                <div className='flex items-center gap-2'>
                    <div className='h-6 w-6 bg-muted rounded-md'></div>
                    <div className='h-5 w-48 bg-muted rounded-md'></div>
                </div>

                {/* Email */}
                <div className='flex items-center gap-2'>
                    <div className='h-6 w-6 bg-muted rounded-md'></div>
                    <div className='h-5 w-56 bg-muted rounded-md'></div>
                </div>

                {/* Meeting agenda header */}
                <div className='h-5 w-64 bg-muted rounded-md mt-4'></div>

                {/* Meeting agenda content */}
                <div className='h-24 w-full bg-muted rounded-md'></div>
            </div>
        </div>
    );
}

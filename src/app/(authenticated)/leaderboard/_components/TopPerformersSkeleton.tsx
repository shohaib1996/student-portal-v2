'use client';

import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const TopPerformersSkeleton = () => {
    return (
        <div className='bg-foreground  rounded-xl overflow-hidden'>
            <div className='overflow-x-auto'>
                <table className='w-full table-auto'>
                    <tbody>
                        {Array(4)
                            .fill(0)
                            .map((_, index) => (
                                <tr
                                    key={index}
                                    className='border-t border-forground-border'
                                >
                                    {/* Medal icon */}
                                    <td className='py-4 pl-4 w-12'>
                                        <Skeleton className='w-10 h-10 rounded-full bg-gray' />
                                    </td>

                                    {/* Rank number */}
                                    <td className='py-4 w-12'>
                                        <div className='flex justify-center'>
                                            <Skeleton className='w-10 h-10 rounded-full bg-gray' />
                                        </div>
                                    </td>

                                    {/* User profile */}
                                    <td className='py-4 min-w-[200px]'>
                                        <div className='flex items-center gap-2'>
                                            <Skeleton className='w-10 h-10 rounded-full bg-gray' />
                                            <Skeleton className='h-4 w-32 bg-gray' />
                                        </div>
                                    </td>

                                    {/* Score */}
                                    <td className='py-4 px-4'>
                                        <div className='text-xs text-gray'>
                                            Score
                                        </div>
                                        <Skeleton className='h-5 w-10 mt-1 bg-gray' />
                                    </td>

                                    {/* Improvement */}
                                    <td className='py-4 px-4'>
                                        <div className='text-xs text-gray'>
                                            Improvement
                                        </div>
                                        <Skeleton className='h-5 w-12 mt-1 bg-gray' />
                                    </td>

                                    {/* Performance */}
                                    <td className='py-4 px-4'>
                                        <Skeleton className='h-5 w-48 bg-gray' />
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopPerformersSkeleton;

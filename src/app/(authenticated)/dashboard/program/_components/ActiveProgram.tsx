import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TProgram, TProgramMain, TProgressChart } from '@/types';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const ActiveProgram = ({
    program,
    myProgram,
    myProgress,
}: {
    program: TProgram;
    myProgram: TProgramMain;
    myProgress: TProgressChart;
}) => {
    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 mb-3 py-2 px-3 bg-foreground rounded-xl overflow-hidden border border-gray-200'>
            <div className='flex flex-col'>
                <div>
                    <h2 className='text-xl font-semibold text-black mb-1'>
                        {program?.title}
                    </h2>

                    <div className='space-y-3 mb-4'>
                        <div className='flex items-center'>
                            <span className='text-black font-semibold text-base mr-1'>
                                Company:
                            </span>
                            <span className='text-gray font-semibold text-base mr-1'>
                                Org With Logo
                            </span>
                        </div>
                        <div className='flex items-center'>
                            <span className='text-black font-semibold text-base mr-1'>
                                Branch:
                            </span>
                            <span className='text-gray font-semibold text-base mr-1'>
                                TS4U IT Engineer Bootcamps
                            </span>
                        </div>
                        <div className='flex items-center'>
                            <span className='text-black font-semibold text-base mr-1'>
                                Session:
                            </span>
                            <span className='text-gray font-semibold text-base mr-1'>
                                {myProgram?.session?.name}
                            </span>
                        </div>
                    </div>

                    <div className='flex items-center gap-2 mb-4'>
                        <div className='w-8 h-8 rounded-full bg-gray-200 overflow-hidden'>
                            <Image
                                src='/avatar.png'
                                alt='John Doe'
                                width={32}
                                height={32}
                            />
                        </div>
                        <div>
                            <div className='text-sm font-medium text-black'>
                                John Doe
                            </div>
                            <div className='text-xs text-gray'>
                                CloudOps Engineer
                            </div>
                        </div>
                    </div>

                    <div className='mb-4'>
                        <div className='flex items-center mb-1 gap-1.5'>
                            <span className='text-black font-semibold text-base mr-1'>
                                Status:
                            </span>
                            <span className='text-green-600 text-base font-medium'>
                                Approved
                            </span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                            <span className='text-dark-gray font-semibold text-base'>
                                Overall Progress{' '}
                                {myProgress?.metrics?.overallPercentageAllItems}
                                %
                            </span>
                        </div>
                        <Progress
                            value={
                                myProgress?.metrics?.overallPercentageAllItems
                            }
                            className='h-4 mt-1.5 bg-primary-light text-primary'
                        />
                    </div>
                </div>

                <div>
                    <Button
                        variant='outline'
                        className='inline-flex items-center gap-1 text-black text-sm font-medium bg-background border border-gray-200 py-3 px-4'
                    >
                        Go to Bootcamp <ArrowRight className='w-4 h-4' />
                    </Button>
                </div>
            </div>

            <div className=''>
                <Image
                    src='/program.png'
                    alt='Active Program Photo'
                    width={640}
                    height={360}
                    className='object-contain md:object-cover w-[802px] h-[336px] rounded-lg'
                />
            </div>
        </div>
    );
};

export default ActiveProgram;

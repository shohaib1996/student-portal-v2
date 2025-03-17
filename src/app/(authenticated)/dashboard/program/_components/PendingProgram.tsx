import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';

const PendingProgram = () => {
    return (
        <div className='border-t border-forground-border'>
            <div className='mb-4 mt-2.5'>
                <h2 className='text-xl font-semibold text-black mb-1'>
                    Pending All Bootcamps
                </h2>
                <p className='text-gray text-sm'>
                    You can see all pending bootcamps
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* Pending Bootcamp Card */}
                <div className='flex items-center justify-center p-1.5 flex-col md:flex-row bg-foreground rounded-xl overflow-hidden border border-gray-200'>
                    <div className=''>
                        <Image
                            src='/program.png'
                            alt='Active Program Photo'
                            width={640}
                            height={360}
                            className='object-contain md:object-cover w-[452px] h-[274px] rounded-lg'
                        />
                    </div>

                    <div className='p-4 md:w-1/2'>
                        <h3 className='text-base font-semibold text-black mb-1'>
                            Flex: AWS DevOps and CloudOps Engineer
                        </h3>

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
                                    2024-May-June
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

                        <div className=''>
                            <div className='flex items-center mb-1 gap-1.5'>
                                <span className='text-black font-semibold text-base mr-1'>
                                    Status:
                                </span>
                                <span className='text-amber-500 text-base font-medium'>
                                    Pending
                                </span>
                            </div>
                            <Button
                                variant='outline'
                                disabled={true}
                                className='inline-flex items-center text-black text-sm font-medium bg-background border border-gray-200 py-3 px-4'
                            >
                                Switch
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingProgram;

'use client';

import type React from 'react';
import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, Variants } from 'framer-motion';
import { TProgram } from '@/types';

interface WhatWillLearnProps {
    bootcamp: TProgram;
    index: number;
}

const WhatWillLearn: React.FC<WhatWillLearnProps> = ({ bootcamp, index }) => {
    const [visibleItems, setVisibleItems] = useState<number>(6);

    const handleSeeMore = () => {
        setVisibleItems(visibleItems + 6);
    };

    const handleSeeLess = () => {
        setVisibleItems(6);
    };

    const totalItems = bootcamp?.whatLearns?.length || 0;
    const showButton = totalItems > 6;
    const isExpanded = visibleItems >= totalItems;

    // Animation variants for list items
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const varientItem = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <section className='xl:py-8 py-5 px-4 bg-violet-50 dark:bg-violet-950'>
            <div className='my-container'>
                <div className='text-center mb-8'>
                    <h2 className='text-2xl font-bold text-black mb-2'>
                        What you&apos;ll learn
                    </h2>
                    <div className='w-20 h-1 bg-emerald-500 mx-auto rounded-full'></div>
                </div>

                <div className='max-w-2xl mx-auto'>
                    <motion.div
                        className='space-y-2'
                        variants={container}
                        initial='hidden'
                        animate='show'
                    >
                        {bootcamp?.whatLearns
                            ?.slice(0, visibleItems)
                            .map((item, i) => (
                                <motion.div
                                    key={item._id}
                                    className='flex items-start gap-4 p-4 py-2 rounded-xl bg-foreground shadow-sm hover:shadow-md transition-shadow duration-300'
                                    variants={varientItem}
                                >
                                    <div className='bg-emerald-100 p-2 rounded-full'>
                                        <CheckCircle className='size-4 text-emerald-600' />
                                    </div>
                                    <p className='text-dark-gray text-lg'>
                                        {item.title}
                                    </p>
                                </motion.div>
                            ))}
                    </motion.div>

                    {showButton && (
                        <div className='pt-4 text-center'>
                            <Button
                                onClick={
                                    isExpanded ? handleSeeLess : handleSeeMore
                                }
                                variant='outline'
                                className='border-emerald-200  text-emerald-700 font-medium rounded-full px-6 group transition-all duration-300'
                            >
                                <span>
                                    {isExpanded ? 'See Less' : 'See More'}
                                </span>
                                {isExpanded ? (
                                    <ChevronUp className='ml-2 h-4 w-4 group-hover:-translate-y-1 transition-transform duration-300' />
                                ) : (
                                    <ChevronDown className='ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform duration-300' />
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default WhatWillLearn;

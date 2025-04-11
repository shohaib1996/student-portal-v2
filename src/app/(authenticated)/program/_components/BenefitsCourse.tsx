'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';
import { cn } from '@/lib/utils';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface BenefitItem {
    _id?: string;
    title: string;
    icon?: string;
}

interface BenefitsCourseProps {
    list?: BenefitItem[];
    title?: string;
    buttonShow?: boolean;
    index: number;
    className?: string;
}

const BenefitsCourse: React.FC<BenefitsCourseProps> = ({
    list = [],
    title = 'Benefits of the Course',
    buttonShow = true,
    index,
    className,
}) => {
    const [visibleItems, setVisibleItems] = useState<number>(6);
    const isMobile = useMediaQuery({
        query: '(max-width: 768px)',
    });

    const handleSeeMore = () => {
        setVisibleItems(visibleItems + 6);
    };

    const handleSeeLess = () => {
        setVisibleItems(6);
    };

    if (!list || list.length === 0) {
        return null;
    }

    const showButton = list.length > 6 && buttonShow;
    const isExpanded = visibleItems >= list.length;

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <section
            className={cn(
                'xl:py-8 py-5 bg-gradient-to-tr from-blue-50 dark:from-blue-950 to-teal-50 dark:to-teal-950',
                className,
            )}
        >
            <div className='container mx-auto px-4 md:px-6'>
                <div
                    className={cn(
                        'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center',
                        index % 2 === 0 && !isMobile
                            ? 'lg:[&>div:first-child]:order-last'
                            : '',
                    )}
                >
                    <div className='space-y-8'>
                        {title && (
                            <div className='relative'>
                                <h2 className='text-xl md:text-2xl font-bold text-black leading-tight'>
                                    {title}
                                </h2>
                                <div className='h-1 w-20 bg-emerald-500 mt-2 rounded-full'></div>
                            </div>
                        )}

                        <motion.div
                            className='space-y-4'
                            variants={container}
                            initial='hidden'
                            animate='show'
                        >
                            {list.slice(0, visibleItems).map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    className='flex items-center gap-4 p-4 py-2 rounded-xl bg-foreground shadow-sm hover:shadow-md transition-shadow duration-300'
                                    variants={item}
                                >
                                    <div className='bg-emerald-100 p-2 rounded-full flex-shrink-0'>
                                        <CheckCircle className='h-5 w-5 text-emerald-600' />
                                    </div>
                                    <p className='text-dark-gray'>
                                        {benefit.title}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {showButton && (
                            <div className='pt-4'>
                                <Button
                                    onClick={
                                        isExpanded
                                            ? handleSeeLess
                                            : handleSeeMore
                                    }
                                    variant='outline'
                                    className='border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-medium rounded-full px-6 group transition-all duration-300'
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

                    <div
                        className={cn(
                            'relative',
                            isMobile ? 'order-first' : '',
                        )}
                    >
                        <div className='absolute inset-0 bg-gradient-to-tr from-emerald-100 to-sky-100 rounded-3xl transform rotate-2 opacity-70'></div>
                        <div className='relative overflow-hidden rounded-2xl shadow-lg'>
                            <Image
                                src='/program/benifits.png'
                                alt='Course benefits'
                                width={1080}
                                height={720}
                                className='w-full h-auto max-h-96 object-contain'
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className='absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl'></div>
                        <div className='absolute -top-4 -left-4 w-16 h-16 bg-blue-500/20 rounded-full blur-lg'></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsCourse;

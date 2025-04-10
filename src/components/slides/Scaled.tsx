import React from 'react';
import parse from 'html-react-parser';
import { Switch } from '@/components/ui/switch';
import useAspectRatioFitting from '@/hooks/useAspectRatioFitting';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Phone } from 'lucide-react';
import MessagePreview from '../chat/Message/MessagePreview';

interface SlideContent {
    content?: string;
    title?: string;
}

interface ScaledProps {
    slide?: SlideContent;
    isSlideOn?: boolean;
    setIsSlideOn?: (checked: boolean) => void;
    big?: boolean;
    active?: boolean;
    index?: number;
}

function Scaled({
    slide,
    isSlideOn,
    setIsSlideOn,
    big = true,
    active = false,
    index = 0,
}: ScaledProps) {
    const [containerRef, styles] = useAspectRatioFitting(1280, 720);

    const onChange = (checked: boolean) => {
        if (setIsSlideOn) {
            setIsSlideOn(checked);
        }
    };

    const { theme } = useTheme();

    return (
        <div
            ref={containerRef}
            className={`w-full h-full bg-background p-1 overflow-hidden z-50 ${!big && active ? 'bg-primary-light' : ''}`}
        >
            <div
                style={{ ...styles }}
                className={`relative overflow-hidden ${!big && active ? 'bg-primary-light' : ''}`}
            >
                <div className={`w-full h-full absolute bg-transparent`}>
                    {big && (
                        <div className='h-[8%] bg-primary-light flex justify-between items-center p-1 rounded-lg'>
                            <div className='flex items-center'>
                                <Image
                                    src={
                                        theme !== 'dark'
                                            ? '/logo/logo.png'
                                            : '/logo/logo-white.png'
                                    }
                                    width={200}
                                    height={70}
                                    alt='logo'
                                />
                            </div>
                            <p className='text-primary-white font-bold text-lg'>
                                {index + 1}
                            </p>
                            <div className='flex items-center mr-4'>
                                {setIsSlideOn && (
                                    <div className='flex items-center space-x-2'>
                                        <span>
                                            {isSlideOn
                                                ? 'Cursor On'
                                                : 'Cursor Off'}
                                        </span>
                                        <Switch
                                            checked={isSlideOn}
                                            onCheckedChange={onChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div
                        style={{ minHeight: '80%' }}
                        className='h-[calc(100%-20%)] p-10 overflow-auto 
                        scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full'
                    >
                        <div className='slide-content'>
                            {/* {parse(slide?.content || '')} */}
                            <MessagePreview text={slide?.content || ''} />
                        </div>
                    </div>

                    {big && (
                        <div className='bg-primary-light p-2 absolute bottom-0 w-full'>
                            <div className='flex justify-between items-center'>
                                <div className='flex items-center'>
                                    <Phone size={18} />
                                    {':'}
                                    <p className='text-lg'>(586)276-7347</p>
                                </div>
                                <div>
                                    <p className='text-lg text-primary-white'>
                                        Web: https://www.schoolshub.ai
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Add these styles to your global CSS or a CSS module to handle the custom scrollbar
// Or use a plugin like tailwind-scrollbar
/*
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thumb-gray-500 {
    scrollbar-color: #6b7280 transparent;
  }
  .scrollbar-track-gray-200 {
    scrollbar-track-color: #e5e7eb;
  }
  .scrollbar-thumb-rounded-full {
    scrollbar-radius: 9999px;
  }
}
*/

export default Scaled;

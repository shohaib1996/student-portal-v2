import React from 'react';
import { Switch } from '@/components/ui/switch';
import useAspectRatioFitting from '@/hooks/useAspectRatioFitting';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Phone } from 'lucide-react';
import { renderText } from '../lexicalEditor/renderer/renderText';

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
            className={`w-full h-full overflow-hidden z-50 ${
                !big && active ? 'bg-primary-light' : 'bg-background'
            } p-1`}
        >
            <div
                style={{ ...styles }}
                className={`relative overflow-hidden ${
                    !big && active ? 'bg-primary-light' : ''
                }`}
            >
                <div className='w-full h-full absolute bg-transparent flex flex-col'>
                    {/* Header section */}
                    <div
                        className={`${big ? 'h-[8%]' : 'h-[10%]'} bg-primary-light flex justify-between items-center ${big ? 'p-1' : 'p-px'} rounded-lg`}
                    >
                        <div className='flex items-center'>
                            <Image
                                src={
                                    theme !== 'dark'
                                        ? '/logo-blue.png'
                                        : '/logo.png'
                                }
                                width={big ? 200 : 40}
                                height={big ? 70 : 14}
                                alt='logo'
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        {big && (
                            <p className='text-primary-white font-bold text-lg'>
                                {index + 1}
                            </p>
                        )}
                        <div className='flex items-center mr-4'>
                            {setIsSlideOn && big && (
                                <div className='flex items-center space-x-2'>
                                    <span>
                                        {isSlideOn ? 'Cursor On' : 'Cursor Off'}
                                    </span>
                                    <Switch
                                        checked={isSlideOn}
                                        onCheckedChange={onChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main content */}
                    <div
                        className={`flex-grow overflow-hidden ${big ? 'p-10' : 'p-1'}`}
                        style={
                            !big
                                ? {
                                      transform: 'scale(0.4)',
                                      transformOrigin: 'top left',
                                      width: '250%', // Scale factor reciprocal (1/0.4 = 2.5)
                                      height: '250%',
                                      maxHeight: '85%',
                                  }
                                : { minHeight: '80%' }
                        }
                    >
                        <div className='slide-content'>
                            {renderText({ text: slide?.content || '' })}
                        </div>
                    </div>

                    {/* Footer section */}
                    {(big || (!big && active)) && (
                        <div
                            className={`bg-primary-light w-full mt-auto ${big ? 'p-2' : 'p-px'}`}
                            style={!big ? { height: '5%' } : {}}
                        >
                            <div className='flex justify-between items-center'>
                                <div className='flex items-center'>
                                    <Phone
                                        size={big ? 18 : 6}
                                        className='min-w-3'
                                    />
                                    <span className={big ? '' : 'text-xs'}>
                                        :
                                    </span>
                                    <p className={big ? 'text-lg' : 'text-xs'}>
                                        (586)276-7347
                                    </p>
                                </div>
                                <div>
                                    <p
                                        className={`${big ? 'text-lg' : 'text-xs'} text-primary-white`}
                                    >
                                        Web: https://www.bootcampshub.ai
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

export default Scaled;

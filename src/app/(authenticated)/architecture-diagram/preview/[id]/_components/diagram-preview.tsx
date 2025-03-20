'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useGetMyDiagramQuery } from '@/redux/api/diagram/diagramApi';
import DiagramComponent from '@/components/global/diagram/diagram-component';
import { GlobalCommentsSection } from '@/components/global/GlobalCommentSection';

import { ArrowLeft, Fullscreen, Minimize } from 'lucide-react';

const DiagramPreviewComponent = () => {
    const params = useParams();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { data, isLoading, error, isFetching } = useGetMyDiagramQuery({
        page: 1,
        limit: 10,
    });

    if (isLoading) {
        return <div>pleaes wait...</div>;
    }

    if (error) {
        return <div>something went wrong!</div>;
    }

    const currentId = params.id;
    const diagram = data?.diagrams?.find((item) => item._id === currentId);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Full screen styles
    const fullScreenStyle: React.CSSProperties = isFullScreen
        ? {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 50,
              backgroundColor: 'white',
              overflow: 'auto',
          }
        : {};

    return (
        <div>
            {!isFullScreen && (
                <div className='flex items-center gap-1 mb-3 border-b pb-2'>
                    <Link href='/architecture-diagram'>
                        <Button variant='ghost'>
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <span>{diagram?.title}</span>
                </div>
            )}

            <div style={fullScreenStyle} className='relative'>
                {isFullScreen ? (
                    <div className='absolute top-4 right-4 z-10'>
                        <Button
                            variant='outline'
                            className='p-2'
                            onClick={toggleFullScreen}
                        >
                            <Minimize />
                        </Button>
                    </div>
                ) : (
                    <div className='absolute top-4 right-4 z-10'>
                        <Button
                            variant='outline'
                            className='p-2'
                            onClick={toggleFullScreen}
                        >
                            <Fullscreen />
                        </Button>
                    </div>
                )}

                <DiagramComponent
                    height={isFullScreen ? '100vh' : '720px'}
                    diagram={diagram?.attachments as string[]}
                    viewMode={false}
                />
            </div>

            {!isFullScreen && (
                <div className='p-4'>
                    <GlobalCommentsSection />
                </div>
            )}
        </div>
    );
};

export default DiagramPreviewComponent;

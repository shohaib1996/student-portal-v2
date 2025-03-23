import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TLessonInfo } from '@/types';
import React from 'react';

const VideoContent = ({
    videoData,
}: {
    videoData: {
        videoInfo: null | TLessonInfo;
        isSideOpen: boolean;
    };
}) => {
    if (!videoData || (!videoData?.videoInfo && videoData?.isSideOpen)) {
        return <div>Loading...</div>; // Return loading if videoInfo is null or videoData is not provided
    }
    const tabs = [
        {
            title: 'summary',
            label: 'Summary',
            data: videoData?.videoInfo?.data?.summary,
        },
        {
            title: 'interview',
            label: 'Interview',
            data: videoData?.videoInfo?.data?.interview,
        },
        {
            title: 'behavioral',
            label: 'Behavioral',
            data: videoData?.videoInfo?.data?.behavioral,
        },
    ];
    return (
        <div
            className={`${videoData?.isSideOpen ? 'lg:col-span-1' : 'hidden'} `}
        >
            {/* / <div className="w-full overflow-hidden rounded-lg "> */}
            {/* <div className="w-full overflow-hidden rounded-lg"> */}
            {videoData?.videoInfo?.url && (
                <iframe
                    src={videoData?.videoInfo?.url}
                    title='Video Content'
                    // className="w-full rounded-lg md:h-[300px] lg:h-[350px]"
                    className='aspect-video w-full rounded-lg'
                    allowFullScreen // Optional, allows full-screen playback
                ></iframe>
            )}
            {/* </div> */}
            <p className='mt-common text-xl font-bold text-primary'>
                {videoData?.videoInfo?.title}
            </p>
            <div>
                <p className='text-lg font-semibold text-gray'>Resources</p>
                <div>
                    <Tabs defaultValue={tabs[0].title} className='w-full'>
                        <TabsList className='w-full justify-evenly bg-background md:gap-common'>
                            {tabs?.map((tab) => (
                                <TabsTrigger
                                    key={tab?.title}
                                    value={tab?.title}
                                    className='data-[state=active]:text-pure-white rounded-full bg-foreground py-2 text-black data-[state=active]:bg-primary lg:px-8'
                                >
                                    {tab?.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {tabs?.map((tab) => (
                            <TabsContent key={tab?.title} value={tab?.title}>
                                <p className='whitespace-pre-line text-sm font-semibold text-gray'>
                                    {tab?.data}
                                </p>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default VideoContent;

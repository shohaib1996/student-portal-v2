'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewMoreLink } from './view-more-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentItem } from './document-item';
import { OverviewIcon, UpcomingIcon } from '@/components/svgs/dashboard'; // Added icons import
import {
    useGetLabContentQuery,
    useGetMyDocumentQuery,
    useGetMySlidesQuery,
} from '@/redux/api/documents/documentsApi';
import { TSlide } from '@/types';
import Image from 'next/image';
import dayjs from 'dayjs';

export function DocumentsSection() {
    const {
        data: documentData,
        error: docError,
        isLoading: docLoading,
    } = useGetMyDocumentQuery({
        page: 1,
        limit: 10,
    });

    const {
        data: labsData,
        error: labError,
        isLoading: labLoading,
    } = useGetLabContentQuery({
        page: 1,
        limit: 10,
    });

    const { data, error, isLoading } = useGetMySlidesQuery(
        {
            page: 1,
            limit: 10,
        },
        {
            refetchOnMountOrArgChange: true,
            refetchOnReconnect: true,
        },
    );

    const documents = documentData?.documents || [];
    const allLabsData = labsData?.contents || [];
    const allSlides = (data?.slides as TSlide[]) || [];

    return (
        <Card className='p-2 rounded-lg shadow-none bg-foreground'>
            <CardHeader className='flex flex-row items-center justify-between p-2 border-b'>
                <div>
                    <h4 className='text-md font-medium'>Documents</h4>
                    <p className='text-xs text-muted-foreground'>
                        Access all your files
                    </p>
                </div>
                <ViewMoreLink href='#' />
            </CardHeader>
            <CardContent className='p-2'>
                <Tabs defaultValue='my-documents' className='border-b mt-1'>
                    <TabsList className='bg-transparent'>
                        <TabsTrigger
                            value='my-documents'
                            className='border-b rounded-none data-[state=active]:text-primary-white data-[state=active]:font-semibold data-[state=active]:border-primary-white data-[state=active]:shadow-none flex items-center gap-1 text-xs data-[state=active]:bg-transparent'
                        >
                            <OverviewIcon className='text-gray data-[state=active]:text-primary-white' />
                            My Documents
                        </TabsTrigger>
                        <TabsTrigger
                            value='documents-labs'
                            className='border-b rounded-none data-[state=active]:text-primary-white data-[state=active]:font-semibold data-[state=active]:border-primary-white data-[state=active]:shadow-none flex items-center gap-1 text-xs data-[state=active]:bg-transparent'
                        >
                            <UpcomingIcon className='data-[state=active]:text-primary-white' />
                            Documents & Labs
                        </TabsTrigger>
                        <TabsTrigger
                            value='presentations'
                            className='border-b rounded-none data-[state=active]:text-primary-white data-[state=active]:font-semibold data-[state=active]:border-primary-white data-[state=active]:shadow-none flex items-center gap-1 text-xs data-[state=active]:bg-transparent'
                        >
                            <UpcomingIcon className='data-[state=active]:text-primary-white' />
                            Presentations
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value='my-documents'
                        className='mt-1 space-y-2 max-h-[420px] overflow-y-auto'
                    >
                        {documents?.map((doc) => (
                            <DocumentItem
                                type='doc'
                                key={doc._id}
                                document={doc}
                                // imageSrc='/images/interview-item-thumbnail.png'
                            />
                        ))}
                    </TabsContent>
                    <TabsContent
                        value='documents-labs'
                        className='mt-1 space-y-2 max-h-[420px] overflow-y-auto'
                    >
                        {allLabsData?.map((doc) => (
                            <DocumentItem
                                type='lab'
                                key={doc._id}
                                document={doc}
                            />
                        ))}
                    </TabsContent>
                    <TabsContent
                        value='presentations'
                        className='mt-1 space-y-2 max-h-[420px] overflow-y-auto'
                    >
                        {allSlides?.map((document) => (
                            <div
                                key={document._id}
                                className='flex items-center gap-3 p-2 border rounded-lg bg-background'
                            >
                                <div className='bg-green-500 rounded-md'>
                                    <Image
                                        src={
                                            '/images/interview-item-thumbnail.png'
                                        }
                                        alt={document?.title}
                                        width={60}
                                        height={60}
                                        className='h-full w-full object-cover'
                                    />
                                </div>
                                <div className='flex-1'>
                                    <div>
                                        <h4 className='font-medium text-sm'>
                                            {document?.title}
                                        </h4>
                                        <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
                                            <div className='flex items-center'>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='12'
                                                    height='12'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    className='lucide lucide-calendar mr-1'
                                                >
                                                    <rect
                                                        width='18'
                                                        height='18'
                                                        x='3'
                                                        y='4'
                                                        rx='2'
                                                        ry='2'
                                                    />
                                                    <line
                                                        x1='16'
                                                        x2='16'
                                                        y1='2'
                                                        y2='6'
                                                    />
                                                    <line
                                                        x1='8'
                                                        x2='8'
                                                        y1='2'
                                                        y2='6'
                                                    />
                                                    <line
                                                        x1='3'
                                                        x2='21'
                                                        y1='10'
                                                        y2='10'
                                                    />
                                                </svg>
                                                {dayjs(
                                                    document?.createdAt,
                                                ).format('MMM DD, YYYY')}{' '}
                                                |{' '}
                                                {dayjs(
                                                    document?.createdAt,
                                                ).format('hh:mm A')}
                                            </div>
                                            <div className='flex items-center'>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='12'
                                                    height='12'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    className='lucide lucide-book-open mr-1'
                                                >
                                                    <path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' />
                                                    <path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ViewMoreLink
                                    href={`presentation-slides/${document?._id}`}
                                />
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

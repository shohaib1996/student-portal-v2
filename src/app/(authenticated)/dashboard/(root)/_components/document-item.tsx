import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ViewMoreLink } from './view-more-link';
import { LabContent, MyDocument } from '@/redux/api/documents/documentsApi';
import parse from 'html-react-parser';
import dayjs from 'dayjs';
import { TSlide } from '@/types';

interface DocumentItemProps {
    document: MyDocument | LabContent;
    type: 'lab' | 'doc';
}

export function DocumentItem({ document, type }: DocumentItemProps) {
    return (
        <div className='flex flex-col md:flex-row items-center gap-3 p-2 border rounded-lg bg-background'>
            {/* Wrapper for thumbnail and details to stay in a row on mobile */}
            <div className='flex w-full gap-3'>
                <div className='rounded-md'>
                    <Image
                        src={
                            (document?.thumbnail as string) ||
                            '/images/interview-item-thumbnail.png'
                        }
                        alt={document?.name || 'document thumbnail'}
                        width={60}
                        height={60}
                        className='object-cover'
                    />
                </div>
                <div className='flex-1'>
                    <div>
                        <h4 className='font-medium text-sm'>
                            {document?.name}
                        </h4>
                        <p className='text-xs text-muted-foreground line-clamp-2'>
                            {parse(document?.description || '')}
                        </p>
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
                                    <line x1='16' x2='16' y1='2' y2='6' />
                                    <line x1='8' x2='8' y1='2' y2='6' />
                                    <line x1='3' x2='21' y1='10' y2='10' />
                                </svg>
                                {dayjs(document?.createdAt).format(
                                    'MMM DD, YYYY',
                                )}{' '}
                                | {dayjs(document?.createdAt).format('hh:mm A')}
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
            </div>
            {/* Button in the second row on mobile */}
            <ViewMoreLink
                href={
                    type === 'doc'
                        ? `my-documents?documentId=${document?._id}&mode=view`
                        : `/documents-and-labs?documentId=${document._id}&mode=view`
                }
            />
        </div>
    );
}

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Clock,
    Download,
    Eye,
    FileText,
    FileX,
    ImageIcon,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { AttachmentsType } from './VideoContent';
import Link from 'next/link';
import GlobalModal from '@/components/global/GlobalModal';
import Image from 'next/image';

const DownloadTab = ({ attachments }: { attachments: AttachmentsType[] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFileType, setSelectedFileType] = useState<string | null>(
        null,
    );
    const [openModal, setOpenModal] = useState(false);

    const getFileIcon = (type: string) => {
        const baseClass =
            'w-10 h-10 rounded-md flex items-center justify-center';
        const iconProps = { className: 'h-5 w-5' };

        switch (type.split('/')[1]) {
            case 'pdf':
                return (
                    <div className={`${baseClass} bg-red-100`}>
                        <FileText
                            {...iconProps}
                            className='h-5 w-5 text-red-600'
                        />
                    </div>
                );
            case 'excel':
                return (
                    <div className={`${baseClass} bg-green-100`}>
                        <FileText
                            {...iconProps}
                            className='h-5 w-5 text-green-600'
                        />
                    </div>
                );
            case 'word':
                return (
                    <div className={`${baseClass} bg-blue-100`}>
                        <FileText
                            {...iconProps}
                            className='h-5 w-5 text-blue-600'
                        />
                    </div>
                );
            case 'code':
                return (
                    <div className={`${baseClass} bg-purple-100`}>
                        <FileText
                            {...iconProps}
                            className='h-5 w-5 text-purple-600'
                        />
                    </div>
                );
            case 'png':
                return (
                    <div className={`${baseClass} bg-pink-100`}>
                        <ImageIcon
                            {...iconProps}
                            className='h-5 w-5 text-pink-600'
                        />
                    </div>
                );
            case 'jpeg':
                return (
                    <div className={`${baseClass} bg-pink-100`}>
                        <ImageIcon
                            {...iconProps}
                            className='h-5 w-5 text-pink-600'
                        />
                    </div>
                );
            case 'jpg':
                return (
                    <div className={`${baseClass} bg-pink-100`}>
                        <ImageIcon
                            {...iconProps}
                            className='h-5 w-5 text-pink-600'
                        />
                    </div>
                );
            case 'webp':
                return (
                    <div className={`${baseClass} bg-pink-100`}>
                        <ImageIcon
                            {...iconProps}
                            className='h-5 w-5 text-pink-600'
                        />
                    </div>
                );
            default:
                return (
                    <div className={`${baseClass} bg-amber-100`}>
                        <FileText
                            {...iconProps}
                            className='h-5 w-5 text-amber-600'
                        />
                    </div>
                );
        }
    };

    const filteredMaterials = attachments?.filter((material) => {
        const matchesSearch = material.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = selectedFileType
            ? material.type === selectedFileType
            : true;
        return matchesSearch && matchesType;
    });

    const fileTypes = Array.from(new Set(attachments?.map((m) => m.type)));

    function downloadFile(params: any) {
        toast.warning('This file is not available for download yet.');
    }
    function viewFile(params: any) {
        toast.warning('This file is not available for viewing yet.');
    }
    console.log(attachments);

    return (
        <>
            {attachments?.length < 1 || !attachments ? (
                <div className='flex flex-col mt-2 items-center justify-center p-8 bg-slate-50 rounded-lg text-center h-full'>
                    <h3 className='text-lg font-medium mb-2'>
                        No Attachment Available
                    </h3>
                    <p className='text-muted-foreground mb-4'>
                        When we add any attachments, you will see them here.
                        Thank you for visiting.
                    </p>
                </div>
            ) : (
                <div className='py-2'>
                    {/* 🔍 Search and Filter */}
                    <div className='border border-border rounded-md '>
                        <div className='p-2 border-b border-border'>
                            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                                <h3 className='text-lg font-medium text-black'>
                                    Program Materials
                                </h3>
                                <div className='flex items-center gap-2 w-full sm:w-auto'>
                                    <div className='relative flex-1 sm:flex-initial'>
                                        <Search className='h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray' />
                                        <Input
                                            placeholder='Search files...'
                                            className='pl-9 w-full sm:w-[250px] border-border rounded-lg'
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='primary_light'
                                                className='relative'
                                            >
                                                <SlidersHorizontal
                                                    size={20}
                                                    className='text-primary-white font-bold'
                                                />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[180px] p-0'>
                                            <div className='p-0'>
                                                <div className='px-3 py-2 border-b border-border flex justify-between items-center'>
                                                    <span className='text-sm font-medium text-dark-gray'>
                                                        Filter by type
                                                    </span>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        className='h-6 px-0 text-xs text-gray'
                                                        onClick={() =>
                                                            setSelectedFileType(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                                <div className='max-h-[200px] overflow-hidden py-1'>
                                                    {fileTypes.map((type) => (
                                                        <button
                                                            key={type}
                                                            className={`w-full text-left px-3 py-2 text-sm border-border-primary-light border  border-l-0 border-r-0 border-t-0 border-b ${
                                                                selectedFileType ===
                                                                type
                                                                    ? 'bg-primary text-pure-white '
                                                                    : 'text-dark-gray hover:text-black hover:bg-foreground'
                                                            }`}
                                                            onClick={() =>
                                                                setSelectedFileType(
                                                                    type,
                                                                )
                                                            }
                                                        >
                                                            {type
                                                                ?.charAt(0)
                                                                ?.toUpperCase() +
                                                                type?.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* 📄 File Grid */}
                        {filteredMaterials?.length === 0 ? (
                            <div className='p-2 text-center text-gray'>
                                <FileX className='h-12 w-12 mx-auto mb-3 text-dark-gray' />
                                <p>No files match your search criteria.</p>
                                <Button
                                    variant='link'
                                    className='mt-2 text-primary-white'
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedFileType(null);
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden'>
                                {/* Left Column */}
                                <div className='divide-y divide-border'>
                                    {filteredMaterials
                                        ?.filter((_, index) => index % 2 === 0)
                                        ?.map((material) => (
                                            <div
                                                key={material?._id}
                                                className='p-2 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-foreground'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    {getFileIcon(
                                                        material?.type,
                                                    )}
                                                    <div className='min-w-0 flex-1'>
                                                        <h4 className='font-medium text-black overflow-hidden  text-wrap'>
                                                            {material?.name}
                                                        </h4>
                                                        <div className='flex items-center gap-1 text-sm text-gray'>
                                                            <Clock className='h-3.5 w-3.5' />
                                                            <span>
                                                                {new Date(
                                                                    material?.createdAt,
                                                                ).toLocaleDateString()}{' '}
                                                                |{' '}
                                                                {new Date(
                                                                    material?.createdAt,
                                                                ).toLocaleTimeString()}
                                                            </span>
                                                            <span className='mx-1'>
                                                                •
                                                            </span>
                                                            <span>
                                                                {material?.size}{' '}
                                                                kb
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-1 ml-2'>
                                                    {/* <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='text-gray hover:text-dark-gray h-8 w-8'
                                                    onClick={() =>
                                                        setOpenModal(true)
                                                    }
                                                >
                                                    <Eye className='h-4 w-4' />
                                                </Button> */}

                                                    <Link
                                                        href={material?.url}
                                                        download
                                                    >
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='text-gray hover:text-dark-gray h-8 w-8'
                                                        >
                                                            <Download className='h-4 w-4' />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* Right Column */}
                                <div className='divide-y divide-border'>
                                    {filteredMaterials
                                        ?.filter((_, index) => index % 2 === 1)
                                        ?.map((material) => (
                                            <div
                                                key={material?._id}
                                                className='p-2 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-foreground'
                                            >
                                                <div className='flex items-center gap-3'>
                                                    {getFileIcon(
                                                        material?.type,
                                                    )}
                                                    <div className='min-w-0 flex-1'>
                                                        <h4 className='font-medium text-black truncate'>
                                                            {material?.name}
                                                        </h4>
                                                        <div className='flex items-center gap-1 text-sm text-gray'>
                                                            <Clock className='h-3.5 w-3.5' />
                                                            <span>
                                                                {new Date(
                                                                    material?.createdAt,
                                                                ).toLocaleDateString()}{' '}
                                                                |{' '}
                                                                {new Date(
                                                                    material?.createdAt,
                                                                ).toLocaleTimeString()}
                                                            </span>
                                                            <span className='mx-1'>
                                                                •
                                                            </span>
                                                            <span>
                                                                {material?.size}{' '}
                                                                kb
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-1 ml-2'>
                                                    {/* <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='text-gray hover:text-dark-gray h-8 w-8'
                                                >
                                                    <Eye className='h-4 w-4' />
                                                </Button> */}

                                                    <Link
                                                        href={material?.url}
                                                        download
                                                    >
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='text-gray hover:text-dark-gray h-8 w-8'
                                                        >
                                                            <Download className='h-4 w-4' />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* <GlobalModal open={openModal} setOpen={setOpenModal}><Image</GlobalModal> */}
        </>
    );
};

export default DownloadTab;

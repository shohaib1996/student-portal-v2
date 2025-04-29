import { ReactNode, useState } from 'react';
import {
    Download,
    File,
    FileText,
    Image,
    Film,
    Music,
    Archive,
    FileCode,
    FilePlus,
} from 'lucide-react';

// Define types for file objects
type FileObject = {
    name: string;
    size: number | string;
    url?: string;
};

type FileAttachmentsProps = {
    files?: FileObject[];
};

// Function to determine file type icon based on file extension
const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const fileTypeMap: Record<string, ReactNode> = {
        // Documents
        pdf: <FileText className='h-4 w-4 text-orange-500' />,
        doc: <FileText className='h-4 w-4 text-blue-500' />,
        docx: <FileText className='h-4 w-4 text-blue-500' />,
        txt: <FileText className='h-4 w-4 text-gray-500' />,

        // Images
        jpg: <Image className='h-4 w-4 text-green-500' />,
        jpeg: <Image className='h-4 w-4 text-green-500' />,
        png: <Image className='h-4 w-4 text-green-500' />,
        gif: <Image className='h-4 w-4 text-purple-500' />,

        // Audio/Video
        mp3: <Music className='h-4 w-4 text-purple-500' />,
        mp4: <Film className='h-4 w-4 text-blue-500' />,

        // Archives
        zip: <Archive className='h-4 w-4 text-yellow-500' />,
        rar: <Archive className='h-4 w-4 text-yellow-500' />,

        // Code
        js: <FileCode className='h-4 w-4 text-yellow-500' />,
        jsx: <FileCode className='h-4 w-4 text-blue-500' />,
        ts: <FileCode className='h-4 w-4 text-blue-500' />,
        tsx: <FileCode className='h-4 w-4 text-blue-500' />,
        json: <FileCode className='h-4 w-4 text-gray-500' />,
        html: <FileCode className='h-4 w-4 text-orange-500' />,
        css: <FileCode className='h-4 w-4 text-blue-500' />,
    };

    return fileTypeMap[extension] || <File className='h-4 w-4 text-gray-500' />;
};

// Format file size (bytes to KB, MB)
const formatFileSize = (bytes: number | string): string => {
    if (typeof bytes === 'string') {
        return bytes;
    }
    if (!bytes) {
        return '0 Bytes';
    }

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const DocumentList: React.FC<FileAttachmentsProps> = ({ files = [] }) => {
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(
        null,
    );

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (!files || files.length === 0) {
        return null;
    }

    console.log(files);

    return (
        <div className='border rounded-lg p-4 bg-gray-50 dark:bg-gray-800'>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
                <FilePlus className='h-4 w-4' />
                <span>Attached Files</span>
                <span className='text-xs text-gray-500 font-normal ml-1'>
                    ({files.length})
                </span>
            </h3>

            <div className='space-y-2'>
                {files.map((file, index) => (
                    <div
                        key={index}
                        className='flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'
                    >
                        <div className='flex items-center gap-3 flex-1 min-w-0'>
                            <div className='h-8 w-8 min-w-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded'>
                                {getFileIcon(file.name)}
                            </div>

                            <div className='min-w-0'>
                                <p className='text-sm font-medium truncate max-w-full'>
                                    {file.name}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {typeof file.size === 'number'
                                        ? formatFileSize(file.size)
                                        : file.size}
                                </p>
                            </div>
                        </div>

                        <button
                            className='flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50'
                            onClick={() =>
                                handleDownload(file?.url || '', file.name)
                            }
                            disabled={downloadingIndex === index || !file.url}
                            aria-label='Download file'
                        >
                            <Download
                                className={`h-4 w-4 ${downloadingIndex === index ? 'animate-pulse text-blue-500' : ''}`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentList;

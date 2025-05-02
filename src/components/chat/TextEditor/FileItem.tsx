'use client';
import { X, Loader } from 'lucide-react';
import AudioCard from './AudioCard';

// Define file types
const imageTypes = [
    'image/bmp',
    'image/cis-cod',
    'image/gif',
    'image/jpeg',
    'image/pipeg',
    'image/x-xbitmap',
    'image/png',
    'image/webp',
];

// Convert bytes to readable size
function bytesToSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Byte';
    }
    const i = Number.parseInt(
        Math.floor(Math.log(bytes) / Math.log(1024)).toString(),
    );
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

// Determine icon source based on file type
const determineIconSrc = (fileType: string, url?: string): string => {
    switch (fileType) {
        case 'application/pdf':
            return '/icons/file-type/pdf.png';
        case 'text/plain':
            return '/icons/file-type/txt-file.png';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return '/icons/file-type/doc.png';
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return '/icons/file-type/sheets.png';
        case 'text/csv':
            return '/icons/file-type/sheets.png';
        case 'application/zip':
        case 'application/x-zip-compressed':
            return '/icons/file-type/zip.png';
        default:
            if (imageTypes.includes(fileType)) {
                return url || '/icons/file-type/file.png';
            }
            return '/icons/file-type/file.png';
    }
};

interface FileItemProps {
    file: {
        type?: string;
        url?: string;
        status?: string;
        name?: string;
        size?: number;
        file?: {
            type?: string;
            name?: string;
            size?: number;
        };
    };
    index: number;
    handleRemove: (index: number) => void;
}

function FileItem({ file, index, handleRemove }: FileItemProps) {
    const iconSrc = determineIconSrc(file.type || '', file?.url);
    const fileType = file.type?.split('/')[0] || '';
    return (
        <div
            className={`relative flex items-center p-1 rounded-md border ${file?.status === 'uploading' ? 'bg-muted/50' : 'bg-background'}`}
        >
            {file?.file?.type === 'audio/mp3' || file?.type === 'audio/mp3' ? (
                <AudioCard audioUrl={file?.url || ''} />
            ) : file?.status === 'uploading' ? (
                <div className='flex justify-center items-center w-full h-full'>
                    <Loader className='h-4 w-4 animate-spin text-muted-foreground' />
                </div>
            ) : (
                <div className='flex items-center'>
                    <div className='w-[60px] h-[60px] flex items-center justify-center overflow-hidden rounded-md'>
                        {fileType === 'video' ? (
                            <img
                                className='w-[60px] h-[60px] object-cover'
                                src='/video-icon.png'
                                alt='Video file'
                            />
                        ) : fileType === 'image' ? (
                            <img
                                className='w-full h-full object-cover'
                                src={iconSrc || '/default_image.png'}
                                alt='Image file'
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const currentSrc = target.src;

                                    // Only apply special handling for AVIF images
                                    if (
                                        currentSrc
                                            .toLowerCase()
                                            .endsWith('.avif') ||
                                        currentSrc
                                            .toLowerCase()
                                            .includes('.avif?')
                                    ) {
                                        // Alternative visualization for AVIF images
                                        const imgContainer =
                                            target.parentElement;
                                        if (imgContainer) {
                                            // Create a placeholder div with AVIF icon
                                            const placeholder =
                                                document.createElement('div');
                                            placeholder.className =
                                                'w-full h-full flex items-center justify-center bg-gray-100';
                                            placeholder.innerHTML = `
                                    <div class="flex flex-col items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                      </svg>
                                      <span class="mt-2 text-xs text-gray-600">AVIF Image</span>
                                    </div>
                                  `;

                                            // Replace the image with our placeholder
                                            imgContainer.replaceChild(
                                                placeholder,
                                                target,
                                            );
                                        }
                                    } else {
                                        // For other image types, just use the default fallback
                                        target.src = '/default_image.png';
                                    }
                                }}
                            />
                        ) : fileType === 'application' ? (
                            file?.type === 'application/pdf' ? (
                                <img
                                    className='w-full h-full object-cover'
                                    src='/pdf.png'
                                    alt='PDF file'
                                />
                            ) : file?.type &&
                              file?.type.includes('presentation') ? (
                                <img
                                    className='w-full h-full object-cover'
                                    src='/ppt.png'
                                    alt='Presentation file'
                                />
                            ) : (
                                <img
                                    className='w-full h-full object-cover'
                                    src='/file_icon.png'
                                    alt='Application file'
                                />
                            )
                        ) : (
                            <img
                                className='w-full object-cover'
                                src='/file_icon.png'
                                alt='File'
                            />
                        )}
                    </div>

                    {/* <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium truncate max-w-[200px]">
                  {file.name || file.file?.name || "N/A"}
                </h5>
                {file?.status === 'uploading' && (
                  <Loader className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">
                  {mime.extension(file.type || file?.file?.type || '') || "File"}
                </span>
                <span className="ml-1">
                  ({bytesToSize(file.size || file?.file?.size || 0)})
                </span>
              </div>
            </div> */}
                </div>
            )}

            <button
                onClick={() => handleRemove(index)}
                className='absolute bg-danger -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 rounded-full text-white transition-colors'
                aria-label='Remove file'
            >
                <X size={12} />
            </button>
        </div>
    );
}

export default FileItem;

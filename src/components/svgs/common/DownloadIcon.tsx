import { cn } from '@/lib/utils'; // Assuming you have a utility for combining classNames

interface DownloadIconProps {
    width?: string;
    height?: string;
    color?: string;
    className?: string;
}

const DownloadIcon = ({
    width = 'w-6',
    height = 'h-6',
    color = 'stroke-[#5C5958]',
    className,
}: DownloadIconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className={cn(width, height, className)}
            viewBox='0 0 24 24'
            fill='none'
        >
            <path
                d='M9 11V17L11 15'
                className={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M9 17L7 15'
                className={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14'
                className={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M22 10H18C15 10 14 9 14 6V2L22 10Z'
                className={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default DownloadIcon;

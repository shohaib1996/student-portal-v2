import { cn } from '@/lib/utils'; // Assuming you have this utility for combining classNames

interface DeleteTrashIconProps {
    width?: string; // Tailwind width class (e.g., "w-6", "w-8")
    height?: string; // Tailwind height class (e.g., "h-6", "h-8")
    color?: string; // Tailwind stroke color class (e.g., "stroke-red-500", "stroke-gray-500")
    className?: string; // Additional custom classes
}

const DeleteTrashIcon = ({
    width = 'w-6', // Default to 24px (w-6 in Tailwind)
    height = 'h-6', // Default to 24px (h-6 in Tailwind)
    color = 'stroke-[#F34141]', // Default to original color (red)
    className,
}: DeleteTrashIconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className={cn(width, height, className)}
            viewBox='0 0 24 24'
            fill='none'
        >
            <path
                d='M3 6H5H21'
                className={color}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21072 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6'
                className={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M10 11V17'
                className={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M14 11V17'
                className={color}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default DeleteTrashIcon;

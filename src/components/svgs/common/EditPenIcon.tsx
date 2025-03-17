import { cn } from '@/lib/utils'; // Assuming you have this utility for combining classNames

interface EditPenIconProps {
    width?: string;
    height?: string;
    color?: string;
    className?: string;
}

const EditPenIcon = ({
    width = 'w-6',
    height = 'h-6',
    color = 'stroke-[#5C5958]',
    className,
}: EditPenIconProps) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            className={cn(width, height, className)}
            viewBox='0 0 24 24'
            fill='none'
        >
            <path
                d='M13.2594 3.59924L5.04936 12.2892C4.73936 12.6192 4.43936 13.2692 4.37936 13.7192L4.00936 16.9592C3.87936 18.1292 4.71936 18.9292 5.87936 18.7292L9.09936 18.1792C9.54936 18.0992 10.1794 17.7692 10.4894 17.4292L18.6994 8.73924C20.1194 7.23924 20.7594 5.52924 18.5494 3.43924C16.3494 1.36924 14.6794 2.09924 13.2594 3.59924Z'
                className={color}
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M11.8906 5.05078C12.3206 7.81078 14.5606 9.92078 17.3406 10.2008'
                className={color}
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M3 22H21'
                className={color}
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default EditPenIcon;

const LoadingSpinner = ({
    size = 24,
    className,
    ...props
}: {
    size?: number;
    className?: string;
}) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={size}
            height={size}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={`lucide lucide-loader-circle stroke-pure-white animate-spin ${className}`}
            {...props}
        >
            <path d='M21 12a9 9 0 1 1-6.219-8.56' />
        </svg>
    );
};

export default LoadingSpinner;

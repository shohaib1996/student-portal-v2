import { Progress } from '@/components/ui/progress';

interface ModuleItemProps {
    icon: 'module' | 'workshop' | 'interviews' | 'labs';
    title: string;
    uploadCount: number;
    pinnedCount: number;
    completionPercentage: number;
}

export function ModuleItem({
    icon,
    title,
    uploadCount,
    pinnedCount,
    completionPercentage,
}: ModuleItemProps) {
    const getIcon = () => {
        switch (icon) {
            case 'module':
                return (
                    <div className='w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='lucide lucide-layout-grid'
                        >
                            <rect width='7' height='7' x='3' y='3' rx='1' />
                            <rect width='7' height='7' x='14' y='3' rx='1' />
                            <rect width='7' height='7' x='14' y='14' rx='1' />
                            <rect width='7' height='7' x='3' y='14' rx='1' />
                        </svg>
                    </div>
                );
            case 'workshop':
                return (
                    <div className='w-8 h-8 rounded-md bg-warning/10 text-warning flex items-center justify-center'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='lucide lucide-hammer'
                        >
                            <path d='m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9' />
                            <path d='M17.64 15 22 10.64' />
                            <path d='m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91' />
                        </svg>
                    </div>
                );
            case 'interviews':
                return (
                    <div className='w-8 h-8 rounded-md bg-info/10 text-info flex items-center justify-center'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='lucide lucide-users'
                        >
                            <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                            <circle cx='9' cy='7' r='4' />
                            <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
                            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
                        </svg>
                    </div>
                );
            case 'labs':
                return (
                    <div className='w-8 h-8 rounded-md bg-success/10 text-success flex items-center justify-center'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='lucide lucide-flask-conical'
                        >
                            <path d='M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2' />
                            <path d='M8.5 2h7' />
                            <path d='M7 16h10' />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className='flex items-center gap-3 border rounded-md p-2 bg-background'>
            <div className='flex-1'>
                <div className='flex items-center justify-between mb-1'>
                    <span className='font-medium text-sm flex items-center gap-1'>
                        <div className='bg-foreground rounded-md'>
                            {getIcon()}
                        </div>{' '}
                        {title}
                    </span>
                </div>
                <Progress
                    value={completionPercentage}
                    className='h-2 bg-foreground'
                />
                <div className='flex items-center gap-4 mt-1 text-xs text-muted-foreground'>
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
                            className='lucide lucide-upload mr-1'
                        >
                            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                            <polyline points='17 8 12 3 7 8' />
                            <line x1='12' x2='12' y1='3' y2='15' />
                        </svg>
                        newly uploaded {uploadCount}
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
                            className='lucide lucide-pin mr-1'
                        >
                            <line x1='12' x2='12' y1='17' y2='22' />
                            <path d='M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z' />
                        </svg>
                        Pinned {pinnedCount}
                    </div>
                    <div className='ml-auto text-xs text-muted-foreground'>
                        {completionPercentage}% completed
                    </div>
                </div>
            </div>
        </div>
    );
}

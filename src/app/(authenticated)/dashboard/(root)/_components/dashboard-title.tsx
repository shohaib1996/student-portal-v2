import { Button } from '@/components/ui/button';
import { Filters } from './filters';

export function DashboardTitle() {
    return (
        <div className='flex justify-between items-center border-b'>
            <div>
                <h1 className='text-2xl font-bold'>Dashboard</h1>
                <p className='text-muted-foreground text-sm'>
                    Monitor your progress and activities
                </p>
            </div>
            {/* <div className='flex items-center gap-2'>
                <Button variant='outline' size='icon'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-plus'
                    >
                        <path d='M5 12h14' />
                        <path d='M12 5v14' />
                    </svg>
                    <span className='sr-only'>Add</span>
                </Button>
                <Filters />
            </div> */}
        </div>
    );
}

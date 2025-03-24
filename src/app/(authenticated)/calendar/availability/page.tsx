import GlobalHeader from '@/components/global/GlobalHeader';
import { Button } from '@/components/ui/button';
import { BookmarkCheck, RotateCcw, Undo, XCircle } from 'lucide-react';
import React from 'react';

const AvailabilityPage = () => {
    return (
        <div>
            <GlobalHeader
                title='Availability'
                subTitle='Manage Availability with Precision'
                buttons={
                    <div className='flex items-center gap-2'>
                        <Button
                            variant={'secondary'}
                            icon={<RotateCcw size={18} />}
                        >
                            Undo
                        </Button>
                        <Button
                            variant={'secondary'}
                            icon={<XCircle size={18} />}
                        >
                            Cancel
                        </Button>
                        <Button icon={<BookmarkCheck size={18} />}>Save</Button>
                    </div>
                }
            />
        </div>
    );
};

export default AvailabilityPage;

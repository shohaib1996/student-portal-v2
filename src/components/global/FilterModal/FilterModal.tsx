import GlobalModal from '@/components/global/GlobalModal';
import React, { useEffect, useState } from 'react';
import QueryBuilder, { TConditions } from './QueryBuilder';
import { Button } from '@/components/ui/button';
import FilterIcon from '@/components/svgs/common/FilterIcon';
import { XCircle } from 'lucide-react';

type TProps = {
    columns: {
        label: string;
        value: string;
        type?: 'select';
        options?: { label: string; value: any }[];
    }[];
    onChange: (_: TConditions[], __: Record<string, string>) => void;
    value: TConditions[];
};

const FilterModal = ({ columns, onChange, value }: TProps) => {
    const [open, setOpen] = useState(false);
    const [conditions, setConditions] = useState<TConditions[]>([]);

    console.log(value);

    useEffect(() => {
        if (value?.length > 0) {
            setConditions(value);
        } else {
            setConditions([{ field: '', operator: 'equals', value: '' }]);
        }
    }, [value]);

    const handleApply = () => {
        const queryObj: Record<string, string> = {};
        for (const c of conditions) {
            queryObj[c.field] = c.value as string;
        }
        onChange(conditions, queryObj);
        setOpen(false);
    };

    const handleClear = () => {
        setConditions([]);
    };

    return (
        <div>
            <div className='relative'>
                <Button
                    onClick={() => setOpen(!open)}
                    className='text-dark-gray'
                    variant={'primary_light'}
                >
                    <FilterIcon className='stroke-dark-gray' />
                    Filters
                </Button>
                {value.length > 0 && (
                    <div className='size-3 absolute -right-1 -top-1 bg-green-500 rounded-full'></div>
                )}
            </div>
            <GlobalModal
                title='Filters'
                resizable={false}
                className='min-h-[60vh] sm:w-[80vw] md:w-[70vw] w-[90vw] lg:w-[50vw]'
                open={open}
                setOpen={setOpen}
                buttons={
                    <div className='flex gap-2'>
                        <Button
                            onClick={handleClear}
                            variant={'secondary-gray'}
                        >
                            <XCircle size={18} /> Clear All
                        </Button>
                        <Button onClick={handleApply}>Apply</Button>
                    </div>
                }
            >
                <QueryBuilder
                    conditions={conditions}
                    setConditions={setConditions}
                    value={value}
                    columns={columns}
                />
            </GlobalModal>
        </div>
    );
};

export default FilterModal;

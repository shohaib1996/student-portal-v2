import { Input } from '@/components/ui/input';
import { useAppSelector } from '@/redux/hooks';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import GlobalTooltip from '@/components/global/GlobalTooltip';
import { DateRangePicker } from '../DateRangePicker';
import { DatePicker } from '../DatePicket';
import { PlusCircle, Trash } from 'lucide-react';

type TProps = {
    columns: {
        label: string;
        value: string;
        type?: 'select';
        options?: { label: string; value: any }[];
    }[];
    setConditions: Dispatch<SetStateAction<TConditions[]>>;
    conditions: TConditions[];
    value: TConditions[];
};

export type TConditions = {
    field: 'program' | 'date' | 'email' | 'name' | 'session' | string;
    operator: 'range' | 'equals' | 'not equals' | '$in' | 'includes' | string;
    value:
        | string
        | Date
        | string[]
        | {
              startDate: Date;
              endDate: Date;
          };
};

function QueryBuilder({ columns, conditions, setConditions }: TProps) {
    const addCondition = () => {
        const newConditions: TConditions[] = [
            ...conditions,
            { field: '', operator: 'equals', value: '' },
        ];
        setConditions(newConditions);
    };

    const removeCondition = (index: number) => {
        const newConditions = conditions.filter((_, i) => i !== index);
        setConditions(newConditions);
        // updateQuery(newConditions);
    };

    const handleConditionChange = (
        index: number,
        key: keyof TConditions, // Ensure 'key' is a valid key of TConditions
        value: TConditions[keyof TConditions], // Ensure 'value' matches the expected type
    ) => {
        const newConditions: TConditions[] = [...conditions];
        newConditions[index] = {
            ...newConditions[index],
            [key]: value, // Type-safe update
        };
        setConditions(newConditions);
    };

    const renderValueInput = (
        field: string,
        operator: TConditions['operator'],
        value: TConditions['value'],
        index: number,
    ) => {
        if (field === 'id' && operator === 'range') {
            return (
                <Input
                    value={(value as string) || ''}
                    onChange={(e) =>
                        handleConditionChange(index, 'value', e.target.value)
                    }
                    placeholder='Enter range (e.g., 1-100)'
                />
            );
        }

        if (field === 'date' && operator === 'range') {
            const val = value as { startDate: Date; endDate: Date };
            return (
                <DateRangePicker
                    date={{
                        from: val.startDate || new Date(),
                        to: val.endDate || new Date(),
                    }}
                    setDate={(dates) =>
                        handleConditionChange(index, 'value', {
                            startDate: dates?.from,
                            endDate: dates?.to,
                        } as { startDate: Date; endDate: Date })
                    }
                />
            );
        }

        if (field === 'date' && operator === 'equals') {
            return (
                <DatePicker
                    value={value ? dayjs(value as string) : dayjs()}
                    onChange={(date) =>
                        handleConditionChange(
                            index,
                            'value',
                            date?.toDate() || '',
                        )
                    }
                    className='rounded-md border bg-background'
                />
            );
        }

        if (
            field === 'status' &&
            fieldOption?.find((f) => f.value === field)?.type !== 'select'
        ) {
            return (
                <Select
                    value={value as string}
                    onValueChange={(val) =>
                        handleConditionChange(index, 'value', val)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value={'active'}>Active</SelectItem>
                            <SelectItem value={'inactive'}>Inactive</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            );
        }

        if (fieldOption?.find((f) => f.value === field)?.type === 'select') {
            const fData = fieldOption?.find((f) => f.value === field);
            return (
                <Select
                    value={value as string}
                    onValueChange={(val) =>
                        handleConditionChange(index, 'value', val)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder={`Select ${fData?.label}`} />
                    </SelectTrigger>
                    <SelectContent searchable={true}>
                        <SelectGroup>
                            {fData?.options?.map((option, i) => (
                                <SelectItem key={i} value={option?.value}>
                                    {option?.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            );
        }

        return (
            <Input
                value={value as string}
                onChange={(e) =>
                    handleConditionChange(index, 'value', e.target.value)
                }
                placeholder='Enter value'
            />
        );
    };

    const [fieldOption, setFieldOption] = useState<
        {
            value: string;
            label: string;
            type?: 'select';
            options?: { label: string; value: any }[];
        }[]
    >([
        // { value: 'program', label: 'Program' },
        // { value: 'session', label: 'Session' },
        // { value: 'date', label: 'Date' },
    ]);

    // const fields = [
    //     'id',
    //     'name',
    //     'phone',
    //     'email',
    //     'status',
    //     'timeZone',
    //     'assignedTo',
    //     'source',
    //     'group',
    //     'date',
    // ];

    useEffect(() => {
        setFieldOption(() => {
            const newOptions = columns?.map((c) => ({
                value: c.value,
                label: c.label,
                type: c.type,
                options: c.options,
            }));
            const existingValues = new Set(
                newOptions.map((f) => ({
                    value: f.value,
                    label: f.label,
                    type: f?.type,
                    options: f?.options,
                })),
            );

            return [...existingValues];
        });
    }, [columns]);

    return (
        <div className='pt-3 space-y-5 sm:space-y-2'>
            {conditions.map((condition, index) => (
                <div key={index} className='flex w-full gap-2 items-center'>
                    <div
                        className='grid grid-cols-1 sm:grid-cols-3 w-full gap-2 items-center'
                        key={index}
                    >
                        <div className='flex-1'>
                            <Select
                                value={condition.field}
                                onValueChange={(val) =>
                                    handleConditionChange(
                                        index,
                                        'field',
                                        val || '',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Field'>
                                        {fieldOption.find(
                                            (f) => f.value === condition.field,
                                        )?.label || 'Select Field'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select Field</SelectLabel>
                                        {fieldOption
                                            .filter(
                                                (fd) =>
                                                    !conditions.find(
                                                        (c) =>
                                                            c.field ===
                                                            fd.value,
                                                    ),
                                            )
                                            .map((f, i) => (
                                                <SelectItem
                                                    key={i}
                                                    value={f.value}
                                                >
                                                    {f.label}
                                                </SelectItem>
                                            ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='flex-1'>
                            <Select
                                value={'equals'}
                                onValueChange={(val) =>
                                    handleConditionChange(
                                        index,
                                        'operator',
                                        val || '',
                                    )
                                }
                            >
                                <GlobalTooltip tooltip='Read only'>
                                    <div className='cursor-not-allowed'>
                                        <SelectTrigger className='pointer-events-none'>
                                            <SelectValue placeholder='Select operator' />
                                        </SelectTrigger>
                                    </div>
                                </GlobalTooltip>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select Field</SelectLabel>
                                        {condition.field === 'id' ||
                                        condition.field === 'date' ? (
                                            <SelectItem value='range'>
                                                Range
                                            </SelectItem>
                                        ) : null}
                                        <SelectItem value='equals'>
                                            Equals
                                        </SelectItem>
                                        <SelectItem value='not equals'>
                                            Not Equals
                                        </SelectItem>
                                        {condition.field === 'status' ||
                                        condition.field === 'assignedTo' ? (
                                            <SelectItem value='$in'>
                                                In
                                            </SelectItem>
                                        ) : null}
                                        {condition.field !== 'id' &&
                                        condition.field !== 'date' &&
                                        condition.field !== 'status' &&
                                        condition.field !== 'assignedTo' ? (
                                            <>
                                                <SelectItem value='includes'>
                                                    Includes
                                                </SelectItem>
                                            </>
                                        ) : null}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='flex-1 overflow-hidden'>
                            {renderValueInput(
                                condition.field,
                                condition.operator,
                                condition.value,
                                index,
                            )}
                        </div>
                    </div>
                    <Button
                        variant={'plain'}
                        className='bg-background-foreground size-10'
                        onClick={() => removeCondition(index)}
                    >
                        <Trash className='stroke-warning size-5' />
                    </Button>
                </div>
            ))}

            {conditions?.length !== fieldOption.length && (
                <Button
                    className='border border-forground-border'
                    variant={'plain'}
                    onClick={addCondition}
                >
                    <PlusCircle /> Add Filter
                </Button>
            )}
        </div>
    );
}

export default QueryBuilder;

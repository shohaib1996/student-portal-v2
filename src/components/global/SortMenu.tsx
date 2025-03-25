'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { TCustomColumnDef } from '../global/GlobalTable/GlobalTable';
import ArrowDown from '../svgs/common/ArrowDown';
import SimpleBar from 'simplebar-react';
import { MoveUp, MoveDown } from 'lucide-react';
import { createPortal } from 'react-dom';

type TProps = {
    columns: TCustomColumnDef<any>[];
    onChange: (_: Record<string, number>) => void;
    value: Record<string, number>;
};

const SortMenu = ({ columns, onChange, value }: TProps) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [top, setTop] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const [sortData, setSortData] = useState<Record<string, number>>(
        value || {},
    );

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setOpenIndex(null); // Close individual dropdowns
            }
        };

        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, []);

    const column = openIndex !== null ? columns[openIndex] : undefined;

    const handleSortClick = (type: 'ascending' | 'descending') => {
        if (!column) {
            return;
        }
        const obj = {
            ...sortData,
            [column?.accessorKey]: type === 'ascending' ? 1 : -1,
        };

        setSortData(obj);
        onChange(obj);
    };

    useEffect(() => {
        const handlePosition = () => {
            if (open && buttonRef.current) {
                const buttonRect = buttonRef.current.getBoundingClientRect();
                setMenuPosition({
                    top: buttonRect.bottom + window.scrollY,
                    left: buttonRect.left + window.scrollX,
                });
            }
        };

        document.addEventListener('scroll', handlePosition);

        return () => {
            document.removeEventListener('scroll', handlePosition);
        };
    }, [open]);

    useEffect(() => {
        if (open && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: buttonRect.bottom + window.scrollY,
                left: buttonRect.left + window.scrollX,
            });
        }
    }, [open]);

    return (
        <div ref={menuRef} className='relative'>
            <Button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                variant={'sort_button'}
            >
                Sort
            </Button>

            {open &&
                menuPosition.top !== 0 &&
                createPortal(
                    <div
                        className={cn(
                            'absolute p-2 top-10 rounded-md z-50 shadow-md max-h-80 w-64 bg-dropdown border border-forground-border',
                            'right-0',
                        )}
                        style={{
                            // right: 0,
                            top: `${menuPosition.top}px`,
                        }}
                    >
                        <SimpleBar className='h-full'>
                            {columns
                                .filter((c) => c.id !== 'action')
                                ?.map((col, i) => (
                                    <div
                                        className='relative mb-1 text-dark-gray w-full text-base cursor-pointer group'
                                        key={col?.id || i}
                                    >
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTop(
                                                    e.currentTarget.getBoundingClientRect()
                                                        .top,
                                                );
                                                setOpenIndex(
                                                    openIndex === i ? null : i,
                                                );
                                            }}
                                            className={cn(
                                                'flex justify-between hover:bg-secondary border-transparent rounded-lg px-2 py-2 hover:border-secondary-border items-center',
                                                {
                                                    'bg-secondary':
                                                        openIndex === i,
                                                },
                                            )}
                                        >
                                            {typeof col.header === 'function'
                                                ? ''
                                                : col.header}
                                            <ArrowDown className='stroke-dark-gray -rotate-90' />
                                        </div>
                                    </div>
                                ))}
                        </SimpleBar>
                        {openIndex !== null && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    top: `${openIndex === 0 ? 0 : top - 180}px`,
                                }}
                                className='absolute space-y-1 -left-full top-0 bg-dropdown border border-forground-border rounded-lg w-64 p-2 '
                            >
                                <button
                                    onClick={() => handleSortClick('ascending')}
                                    className={cn(
                                        'flex text-dark-gray text-sm gap-2 items-center w-full py-2 px-2 hover:bg-secondary rounded-lg border border-transparent',
                                        {
                                            'bg-secondary border-secondary-border':
                                                sortData[
                                                    column?.accessorKey || ''
                                                ] === 1,
                                        },
                                    )}
                                >
                                    <MoveUp size={16} />
                                    Sort Ascending (A to Z)
                                </button>
                                <button
                                    onClick={() =>
                                        handleSortClick('descending')
                                    }
                                    className={cn(
                                        'flex text-dark-gray text-sm gap-2 items-center w-full py-2 px-2 hover:bg-secondary rounded-lg border border-transparent',
                                        {
                                            'bg-secondary border-secondary-border':
                                                sortData[
                                                    column?.accessorKey || ''
                                                ] === -1,
                                        },
                                    )}
                                >
                                    <MoveDown size={16} />
                                    Sort Descending (Z to A)
                                </button>
                            </div>
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default SortMenu;

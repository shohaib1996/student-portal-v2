'use client';

import { TableIcon } from 'lucide-react';

import { useToolbarContext } from '../../../context/toolbar-context';
import { SelectItem } from '../../../../ui/select';

import { InsertTableDialog } from '../../../plugins/table-plugin';
import { Toggle } from '../../../../ui/toggle';
export function InsertTable({ outsideSelect }: { outsideSelect?: boolean }) {
    const { activeEditor, showModal } = useToolbarContext();

    return (
        <>
            {outsideSelect ? (
                <Toggle
                    size={'sm'}
                    variant={'outline'}
                    aria-label='Insert Table'
                    className='bg-foreground text-dark-gray'
                    onClick={() =>
                        showModal('Insert Table', (onClose) => (
                            <InsertTableDialog
                                activeEditor={activeEditor}
                                onClose={onClose}
                            />
                        ))
                    }
                >
                    <TableIcon className='size-4' />
                </Toggle>
            ) : (
                <SelectItem
                    value='table'
                    onPointerUp={() =>
                        showModal('Insert Table', (onClose) => (
                            <InsertTableDialog
                                activeEditor={activeEditor}
                                onClose={onClose}
                            />
                        ))
                    }
                    className=''
                >
                    <div className='flex items-center gap-1'>
                        <TableIcon className='size-4' />
                        <span>Table</span>
                    </div>
                </SelectItem>
            )}
        </>
    );
}

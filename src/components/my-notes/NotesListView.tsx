import React, { useState } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '../global/GlobalTable/GlobalTable';
import { Badge } from '../ui/badge';
import { Eye, Pencil, Trash, Volume } from 'lucide-react';
import MessagePreview from '../chat/Message/MessagePreview';
import GlobalTooltip from '../global/GlobalTooltip';
import Link from 'next/link';
import TdDate from '../global/TdDate';
import { Button } from '../ui/button';
import { TNote } from '@/types';

const NotesListView = ({ data }: { data: TNote[] }) => {
    const [limit, setLimit] = useState(20);

    const defaultColumns: TCustomColumnDef<TNote>[] = [
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => <span>{row.original.title || 'Untitled'}</span>,
            footer: (data) => data.column.id,
            id: 'title',
            visible: true,
            canHide: false,
        },
        {
            accessorKey: 'Category',
            header: 'Category',
            cell: ({ row }) => (
                <div>
                    <Badge className='bg-primary'>
                        <Volume size={16} />
                        Audio
                    </Badge>
                </div>
            ),
            footer: (data) => data.column.id,
            id: 'Category',
            visible: true,
        },
        {
            accessorKey: 'Description',
            header: 'Description',
            cell: ({ row }) => (
                <GlobalTooltip
                    className='md:max-w-xl max-w-md bg-foreground shadow-md max-h-80 overflow-y-auto'
                    tooltip={
                        <div className='text-dark-gray'>
                            <MessagePreview text={row.original.description} />
                        </div>
                    }
                >
                    <div className='truncate max-w-sm'>
                        {row.original.description}
                    </div>
                </GlobalTooltip>
            ),
            footer: (data) => data.column.id,
            id: 'Description',
            visible: true,
        },
        {
            accessorKey: 'Link',
            header: 'Link',
            cell: ({ row }) => (
                <Link
                    className='font-semibold text-primary-white truncate underline'
                    href={'/my-notes'}
                >
                    {row.original?.purpose?.category}
                </Link>
            ),
            footer: (data) => data.column.id,
            id: 'Link',
            visible: true,
        },
        {
            accessorKey: 'date',
            header: 'Date & Time',
            cell: ({ row }) => <TdDate date={row.original.createdAt} />,
            footer: (data) => data.column.id,
            id: 'date',
            visible: true,
        },
        {
            accessorKey: 'Actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className='flex gap-1 items-center'>
                    <Button
                        className='size-8'
                        variant={'primary_light'}
                        size={'icon'}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button
                        className='size-8'
                        variant={'primary_light'}
                        size={'icon'}
                    >
                        <Pencil size={16} />
                    </Button>
                    <Button
                        className='size-8'
                        variant={'danger_light'}
                        size={'icon'}
                    >
                        <Trash size={16} />
                    </Button>
                </div>
            ),
            footer: (data) => data.column.id,
            id: 'Actions',
            visible: true,
        },
    ];

    return (
        <div>
            <GlobalTable
                isLoading={false}
                limit={limit}
                data={data}
                defaultColumns={defaultColumns}
                tableName='my-templates-table'
            />
        </div>
    );
};

export default NotesListView;

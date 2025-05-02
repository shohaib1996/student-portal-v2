import React, { useState } from 'react';
import GlobalTable, {
    TCustomColumnDef,
} from '../global/GlobalTable/GlobalTable';
import { Badge } from '../ui/badge';
import { Eye, Pencil, Trash, Volume } from 'lucide-react';
import MessagePreview from '../lexicalEditor/renderer/MessagePreview';
import GlobalTooltip from '../global/GlobalTooltip';
import Link from 'next/link';
import TdDate from '../global/TdDate';
import { Button } from '../ui/button';
import { TNote } from '@/types';
import GlobalDeleteModal from '../global/GlobalDeleteModal';
import { useDeleteNoteMutation } from '@/redux/api/notes/notesApi';
import { renderPlainText } from '../lexicalEditor/renderer/renderPlainText';
import { useAppSelector } from '@/redux/hooks';

const NotesListView = ({ data }: { data: TNote[] }) => {
    const [limit, setLimit] = useState(20);
    const { enrollment } = useAppSelector((state) => state.auth);
    console.log(enrollment);
    const [deleteNote, { isLoading }] = useDeleteNoteMutation();

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
            accessorKey: 'tags',
            header: 'Tags',
            cell: ({ row }) => (
                <div className='flex flex-wrap gap-1'>
                    {row.original?.tags?.map((tag) => (
                        <Badge key={tag} variant={'secondary'}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            ),
            footer: (data) => data.column.id,
            id: 'tags',
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
                            {renderPlainText({
                                text:
                                    row.original?.description ||
                                    'New conversation',
                                textSize: 'text-xs',
                                textColor: 'text-darkg-gray',
                                // truncate: true,
                                lineClamp: 2,
                                width: 'w-full',
                            })}
                        </div>
                    }
                >
                    <div className='truncate max-w-sm'>
                        {renderPlainText({
                            text:
                                row.original?.description || 'New conversation',
                            textSize: 'text-xs',
                            textColor: 'text-darkg-gray',
                            // truncate: true,
                            lineClamp: 2,
                            width: 'w-full',
                        })}
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
            cell: ({ row }) => {
                console.log(row.original);
                return (
                    <>
                        {row.original?.purpose?.category === 'lesson' ? (
                            <Link
                                className='font-semibold text-primary-white truncate underline'
                                href={`/program/${
                                    (enrollment as any)?.program?.slug
                                }?content=${row.original?.purpose?.resourceId}`}
                                target='_blank'
                            >
                                {row.original?.purpose?.category}
                            </Link>
                        ) : (
                            row.original?.purpose?.category
                        )}
                    </>
                );
            },
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
                    <Link
                        href={`/my-notes?mode=view&detail=${row.original?._id}`}
                    >
                        <Button
                            className='size-9'
                            variant={'primary_light'}
                            size={'icon'}
                        >
                            <Eye size={16} />
                        </Button>
                    </Link>
                    <Link
                        href={`/my-notes?mode=edit&detail=${row.original?._id}`}
                    >
                        <Button
                            className='size-9'
                            variant={'primary_light'}
                            size={'icon'}
                        >
                            <Pencil size={16} />
                        </Button>
                    </Link>
                    <GlobalDeleteModal
                        modalSubTitle='This action cannot be undone. This will permanently delete your note and remove your data from our servers.'
                        isButton
                        loading={isLoading}
                        deleteFun={deleteNote}
                        _id={row.original._id}
                    />
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

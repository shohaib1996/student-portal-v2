'use client';

import { FileImageIcon } from 'lucide-react';

import { useToolbarContext } from '../../../context/toolbar-context';
import { SelectItem } from '../../../../ui/select';

import { InsertInlineImageDialog } from '../../../plugins/inline-image-plugin';

export function InsertInlineImage({
    onImageUpload,
}: {
    onImageUpload: (file: File) => any;
}) {
    const { activeEditor, showModal } = useToolbarContext();

    return (
        <SelectItem
            value='inline-image'
            onPointerUp={() =>
                showModal('Insert Inline Image', (onClose) => (
                    <InsertInlineImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                        onImageUpload={onImageUpload}
                    />
                ))
            }
            className=''
        >
            <div className='flex items-center gap-1'>
                <FileImageIcon className='size-4' />
                <span>Inline Image</span>
            </div>
        </SelectItem>
    );
}

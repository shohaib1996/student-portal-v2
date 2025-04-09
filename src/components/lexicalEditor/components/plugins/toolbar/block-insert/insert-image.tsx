'use client';

import { ImageIcon } from 'lucide-react';

import { useToolbarContext } from '../../../context/toolbar-context';
import { SelectItem } from '../../../../ui/select';
import { Toggle } from '../../../../ui/toggle';
import { InsertImageDialog } from '../../../plugins/images-plugin';

export function InsertImage({
    onImageUpload,
    outsideSelect,
}: {
    onImageUpload: (file: File) => Promise<string>;
    outsideSelect?: boolean;
}) {
    const { activeEditor, showModal } = useToolbarContext();

    return (
        <>
            {outsideSelect ? (
                <Toggle
                    size={'sm'}
                    variant={'outline'}
                    aria-label='Insert Image'
                    onClick={() => {
                        showModal('Insert Image', (onClose) => (
                            <InsertImageDialog
                                onImageUpload={onImageUpload}
                                activeEditor={activeEditor}
                                onClose={onClose}
                            />
                        ));
                    }}
                >
                    <ImageIcon className='size-4' />
                </Toggle>
            ) : (
                <SelectItem
                    value='image'
                    onPointerUp={(e) => {
                        showModal('Insert Image', (onClose) => (
                            <InsertImageDialog
                                onImageUpload={onImageUpload}
                                activeEditor={activeEditor}
                                onClose={onClose}
                            />
                        ));
                    }}
                    className=''
                >
                    <div className='flex items-center gap-1'>
                        <ImageIcon className='size-4' />
                        <span>Image</span>
                    </div>
                </SelectItem>
            )}
        </>
    );
}

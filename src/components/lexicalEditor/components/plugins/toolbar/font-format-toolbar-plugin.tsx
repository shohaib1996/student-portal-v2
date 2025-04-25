'use client';

import { useState } from 'react';

import { $isTableSelection } from '@lexical/table';
import {
    $isRangeSelection,
    BaseSelection,
    FORMAT_TEXT_COMMAND,
    TextFormatType,
} from 'lexical';
import {
    BoldIcon,
    CodeIcon,
    ItalicIcon,
    StrikethroughIcon,
    UnderlineIcon,
} from 'lucide-react';

import { Toggle } from '../../../ui/toggle';

import { useToolbarContext } from '../../context/toolbar-context';
import { useUpdateToolbarHandler } from '../../editor-hooks/use-update-toolbar';

const Icons: Partial<Record<TextFormatType, React.ElementType>> = {
    bold: BoldIcon,
    italic: ItalicIcon,
    underline: UnderlineIcon,
    strikethrough: StrikethroughIcon,
    code: CodeIcon,
} as const;

export function FontFormatToolbarPlugin({
    format,
}: {
    format: Omit<TextFormatType, 'highlight' | 'subscript' | 'superscript'>;
}) {
    const { activeEditor } = useToolbarContext();
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const $updateToolbar = (selection: BaseSelection) => {
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
            // @ts-ignore
            setIsSelected(selection.hasFormat(format as TextFormatType));
        }
    };

    useUpdateToolbarHandler($updateToolbar);

    const Icon = Icons[format as TextFormatType] as React.ElementType;

    return (
        <Toggle
            aria-label='Toggle bold'
            variant='outline'
            className={` border border-forground-border ${!isSelected ? '!bg-foreground !text-dark-black' : '!bg-primary-light text-primary-white border-primary'}`}
            size='sm'
            defaultPressed={isSelected}
            pressed={isSelected}
            onPressedChange={setIsSelected}
            onClick={() => {
                activeEditor.dispatchCommand(
                    FORMAT_TEXT_COMMAND,
                    format as TextFormatType,
                );
            }}
        >
            <Icon
                className={`h-4 w-4 ${!isSelected ? '!text-dark-black' : '!text-primary-white'}`}
            />
        </Toggle>
    );
}

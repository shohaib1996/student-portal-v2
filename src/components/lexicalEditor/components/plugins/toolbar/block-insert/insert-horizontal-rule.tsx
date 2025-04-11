'use client';

import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { ScissorsIcon } from 'lucide-react';

import { useToolbarContext } from '../../../context/toolbar-context';
import { SelectItem } from '../../../../ui/select';
import { Toggle } from '../../../../ui/toggle';
export function InsertHorizontalRule({
    outsideSelect,
}: {
    outsideSelect?: boolean;
}) {
    const { activeEditor } = useToolbarContext();

    return (
        <>
            {outsideSelect ? (
                <Toggle
                    size={'sm'}
                    variant={'outline'}
                    aria-label='Insert Horizontal Rule'
                    onClick={() =>
                        activeEditor.dispatchCommand(
                            INSERT_HORIZONTAL_RULE_COMMAND,
                            undefined,
                        )
                    }
                    className='flex items-center gap-1 cursor-pointer bg-foreground text-dark-gray'
                >
                    <ScissorsIcon className='size-4' />
                </Toggle>
            ) : (
                <SelectItem
                    value='horizontal-rule'
                    onPointerUp={() =>
                        activeEditor.dispatchCommand(
                            INSERT_HORIZONTAL_RULE_COMMAND,
                            undefined,
                        )
                    }
                    className=''
                >
                    <div className='flex items-center gap-1'>
                        <ScissorsIcon className='size-4' />
                        <span>Horizontal Rule</span>
                    </div>
                </SelectItem>
            )}
        </>
    );
}

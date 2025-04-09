'use client';

import { useCallback, useEffect, useState } from 'react';

import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
    $getSelection,
    $isRangeSelection,
    BaseSelection,
    COMMAND_PRIORITY_NORMAL,
} from 'lexical';
import { KEY_MODIFIER_COMMAND } from 'lexical';
import { LinkIcon, QuoteIcon } from 'lucide-react';

import { Toggle } from '../../../ui/toggle';

import { useFloatingLinkContext } from '../../context/floating-link-context';
import { useToolbarContext } from '../../context/toolbar-context';
import { useUpdateToolbarHandler } from '../../editor-hooks/use-update-toolbar';
import { getSelectedNode } from '../../utils/get-selected-node';
import { sanitizeUrl } from '../../utils/url';
import { $setBlocksType } from '@lexical/selection';
import { $createQuoteNode } from '@lexical/rich-text';

export function QuotePluginToolbar() {
    const { activeEditor } = useToolbarContext();

    const insertQuote = () => {
        activeEditor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    return (
        <Toggle
            size={'sm'}
            variant={'outline'}
            aria-label='Toggle link'
            onClick={insertQuote}
        >
            <QuoteIcon className='h-4 w-4' />
        </Toggle>
    );
}

'use client';

import { useRef, JSX } from 'react';

import { DraggableBlockPlugin_EXPERIMENTAL as DraggableBlockPluginExperimental } from '@lexical/react/LexicalDraggableBlockPlugin';
import { GripVerticalIcon } from 'lucide-react';

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu';

function isOnMenu(element: HTMLElement): boolean {
    return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export function DraggableBlockPlugin({
    anchorElem,
}: {
    anchorElem: HTMLElement | null;
}): JSX.Element | null {
    // Fix 1: Remove the explicit null from the type
    const menuRef = useRef<HTMLDivElement>(null);
    const targetLineRef = useRef<HTMLDivElement>(null);

    if (!anchorElem) {
        return null;
    }

    return (
        <DraggableBlockPluginExperimental
            anchorElem={anchorElem}
            // Fix 2: Cast the refs to the expected type
            menuRef={menuRef as React.RefObject<HTMLElement>}
            targetLineRef={targetLineRef as React.RefObject<HTMLElement>}
            menuComponent={
                <div
                    ref={menuRef}
                    className='draggable-block-menu absolute left-0 top-0 cursor-grab rounded-sm px-[1px] py-0.5 opacity-0 will-change-transform hover:bg-gray-100 active:cursor-grabbing mr-2'
                >
                    <GripVerticalIcon className='size-4 opacity-30 ' />
                </div>
            }
            targetLineComponent={
                <div
                    ref={targetLineRef}
                    className='pointer-events-none absolute left-0 top-0 h-1 bg-secondary-foreground opacity-0 will-change-transform'
                />
            }
            isOnMenu={isOnMenu}
        />
    );
}

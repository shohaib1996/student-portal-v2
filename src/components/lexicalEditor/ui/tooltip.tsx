'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../lib/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { CLEAR_EDITOR_COMMAND } from 'lexical';

function TooltipProvider({
    delayDuration = 0,
    initialMarkdown,
    transformers,
    editorRef,
    ...props
}: React.ComponentProps<any>) {
    const [editor] = useLexicalComposerContext();
    const initializedRef = React.useRef(false);

    React.useEffect(() => {
        // Only load the markdown content initially or if initialMarkdown is explicitly set to empty
        // This prevents overwriting the editor during typing
        if (!initializedRef.current && initialMarkdown && transformers) {
            editor.update(() => {
                if (initialMarkdown) {
                    $convertFromMarkdownString(initialMarkdown, transformers);
                } else {
                    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                }
            });
            initializedRef.current = true;
        }
    }, [initialMarkdown, editor, transformers]);

    // Expose editor methods via ref
    React.useImperativeHandle(
        editorRef,
        () => ({
            clearEditor: () => {
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            },
            focus: () => {
                editor.focus();
            },
            // Add more methods as needed
            getEditor: () => editor,
        }),
        [editor],
    );

    return (
        <TooltipPrimitive.Provider
            data-slot='tooltip-provider'
            delayDuration={delayDuration}
            {...props}
        />
    );
}

function Tooltip({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root data-slot='tooltip' {...props} />
        </TooltipProvider>
    );
}

function TooltipTrigger({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
    return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />;
}

function TooltipContent({
    className,
    sideOffset = 0,
    children,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot='tooltip-content'
                sideOffset={sideOffset}
                className={cn(
                    'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
                    className,
                )}
                {...props}
            >
                {children}
                <TooltipPrimitive.Arrow className='bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]' />
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

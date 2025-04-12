// Create a new file: components/plugins/keyboard-event-plugin.tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

export function KeyboardEventPlugin({
    onKeyDown,
}: {
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!onKeyDown) {
            return;
        }

        // Find the contentEditable element
        const editorElement = editor.getRootElement();
        if (!editorElement) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            // Convert DOM event to React event type (simplified)
            onKeyDown(event as unknown as React.KeyboardEvent<HTMLElement>);
        };

        editorElement.addEventListener('keydown', handleKeyDown);

        return () => {
            editorElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor, onKeyDown]);

    return null;
}

// Create a new file: components/plugins/clear-editor-command-plugin.tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLEAR_EDITOR_COMMAND } from 'lexical';
import { useEffect } from 'react';

export function ClearEditorCommandPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const clearEditorHandler = () => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        };

        // Listen for a custom event to clear the editor
        document.addEventListener('clearEditor', clearEditorHandler);

        return () => {
            document.removeEventListener('clearEditor', clearEditorHandler);
        };
    }, [editor]);

    return null;
}

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND } from 'lexical';
import { $getRoot } from 'lexical';
import { $convertToMarkdownString } from '@lexical/markdown';

// Import all the transformers you're using
import {
    CHECK_LIST,
    ELEMENT_TRANSFORMERS,
    MULTILINE_ELEMENT_TRANSFORMERS,
    TEXT_FORMAT_TRANSFORMERS,
    TEXT_MATCH_TRANSFORMERS,
} from '@lexical/markdown';

type SubmitPluginProps = {
    onSubmit: (text: string) => void;
};

export function SubmitPlugin({ onSubmit }: SubmitPluginProps) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!onSubmit) {
            return;
        }

        return editor.registerCommand(
            KEY_ENTER_COMMAND,
            (event) => {
                // If Shift+Enter is pressed, we want to create a new line
                if (event && event.shiftKey) {
                    return false; // Allow default behavior (new line)
                }

                // For regular Enter without Shift
                if (event && !event.shiftKey) {
                    // Get the editor content with formatting preserved
                    editor.getEditorState().read(() => {
                        // Use markdown conversion to preserve line breaks
                        const text = $convertToMarkdownString([
                            CHECK_LIST,
                            ...ELEMENT_TRANSFORMERS,
                            ...MULTILINE_ELEMENT_TRANSFORMERS,
                            ...TEXT_FORMAT_TRANSFORMERS,
                            ...TEXT_MATCH_TRANSFORMERS,
                        ]);

                        // Check if there's actual content
                        if (text.trim()) {
                            onSubmit(text);

                            // Clear the editor
                            editor.update(() => {
                                const root = $getRoot();
                                root.clear();
                            });
                        }
                    });

                    return true; // Prevent default Enter behavior
                }

                return false;
            },
            COMMAND_PRIORITY_HIGH,
        );
    }, [editor, onSubmit]);

    return null;
}

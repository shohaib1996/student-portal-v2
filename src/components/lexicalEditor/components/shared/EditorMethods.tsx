import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { $getRoot } from 'lexical';

const EditorMethods = React.forwardRef(
    (
        {
            initialMarkdown,
            transformers,
        }: { initialMarkdown?: string; transformers?: any },
        ref,
    ) => {
        const [editor] = useLexicalComposerContext();
        const initializedRef = React.useRef<any>(null);

        React.useEffect(() => {
            if (
                !initializedRef.current?.isRendered ||
                initializedRef.current?.renderedText !== initialMarkdown
            ) {
                editor.update(() => {
                    if (initialMarkdown) {
                        // Convert the Markdown into Lexical nodes
                        $convertFromMarkdownString(
                            initialMarkdown,
                            transformers,
                        );

                        // Move selection to the end of the editor content
                        const root = $getRoot();
                        root.selectEnd();
                    }
                });
                initializedRef.current = {
                    isRendered: true,
                    renderedText: initialMarkdown,
                };
            }
        }, [editor, initialMarkdown, transformers]);

        React.useImperativeHandle(
            ref,
            () => ({
                clearEditor: () => {
                    console.log('clearEditor');
                    editor.update(() => {
                        const root = $getRoot();
                        root.clear();
                    });
                    editor.focus();
                },
                focus: () => {
                    editor.focus();
                },
                getEditor: () => editor,
            }),
            [editor],
        );

        return null;
    },
);

export default EditorMethods;

//display name for debugging
EditorMethods.displayName = 'EditorMethods';

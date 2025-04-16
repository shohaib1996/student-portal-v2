import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';
import {
    $getRoot,
    $insertNodes,
    CLEAR_HISTORY_COMMAND,
    COMMAND_PRIORITY_HIGH,
    INSERT_LINE_BREAK_COMMAND,
    KEY_ENTER_COMMAND,
    SerializedEditorState,
    SerializedLexicalNode,
} from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

const EditorMethods = React.forwardRef(
    (
        {
            initialMarkdown,
            transformers,
            serializedEditorState,
            initialHtml,
        }: {
            initialMarkdown?: string;
            transformers?: any;
            serializedEditorState?: SerializedEditorState;
            initialHtml?: string;
        },
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

        React.useEffect(() => {
            if (editor && initialHtml) {
                editor.update(() => {
                    // In the browser you can use the native DOMParser API to parse the HTML string.
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(
                        initialHtml,
                        'text/html',
                    );

                    // Once you have the DOM instance it's easy to generate LexicalNodes.
                    const nodes = $generateNodesFromDOM(editor, dom);

                    const root = $getRoot();
                    root.clear();
                    root.append(...nodes);
                    root.selectEnd();
                });
            }
        }, [editor, initialHtml]);

        React.useEffect(() => {
            if (!serializedEditorState) {
                return;
            }

            // 1. Serialize the *current* state in the editor.
            const currentEditorJSON = editor.getEditorState().toJSON();
            const currentEditorString = JSON.stringify(currentEditorJSON);

            // 2. Compare it to the *new* serialized editor state passed from props.
            const incomingEditorString = JSON.stringify(serializedEditorState);

            // 3. Only if they differ, update the editor.
            if (currentEditorString !== incomingEditorString) {
                const newEditorState =
                    editor.parseEditorState(incomingEditorString);
                editor.setEditorState(newEditorState);
            }
        }, [editor, serializedEditorState]);

        React.useEffect(() => {
            return editor.registerCommand(
                KEY_ENTER_COMMAND,
                (event) => {
                    // Prevent the default new-paragraph behavior and insert a soft line break
                    editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);

                    // You can also prevent the browser’s default newline if you want:
                    event?.preventDefault();

                    // Returning true means "we handled this command, don't run other handlers"
                    return true;
                },
                COMMAND_PRIORITY_HIGH,
            );
        }, [editor]);

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
                insertHtml: (htmlString: string) => {
                    console.log('insertHtml', htmlString);

                    editor.update(() => {
                        // 1. Parse HTML string into a Document
                        const parser = new DOMParser();
                        const dom = parser.parseFromString(
                            htmlString,
                            'text/html',
                        );

                        console.log(dom);

                        // // 2. Convert DOM body into Lexical nodes
                        // const lexicalNodes = $generateNodesFromDOM(editor, dom.body);

                        // // 3. Insert them into the editor’s root
                        // const root = $getRoot();
                        // root.clear();
                        // root.append(...lexicalNodes);
                    });
                },
            }),
            [editor],
        );

        return null;
    },
);

export default EditorMethods;

//display name for debugging
EditorMethods.displayName = 'EditorMethods';

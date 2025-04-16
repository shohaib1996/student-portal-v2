'use client';

import React, { useEffect, useRef } from 'react';
import {
    InitialConfigType,
    LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import {
    CLEAR_EDITOR_COMMAND,
    EditorState,
    SerializedEditorState,
} from 'lexical';

import { FloatingLinkContext } from '../components/context/floating-link-context';
import { SharedAutocompleteContext } from '../components/context/shared-autocomplete-context';
import { editorTheme } from '../components/themes/editor-theme';
import { TooltipProvider } from '../ui/tooltip';

import { nodes } from './nodes';
import { Plugins } from './plugins';
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
} from '@lexical/markdown';

import {
    CHECK_LIST,
    ELEMENT_TRANSFORMERS,
    MULTILINE_ELEMENT_TRANSFORMERS,
    TEXT_FORMAT_TRANSFORMERS,
    TEXT_MATCH_TRANSFORMERS,
} from '@lexical/markdown';

import { EMOJI } from '../components/transformers/markdown-emoji-transformer';
import { EQUATION } from '../components/transformers/markdown-equation-transofrmer';
import { HR } from '../components/transformers/markdown-hr-transformer';
import { IMAGE } from '../components/transformers/markdown-image-transformer';
import { TABLE } from '../components/transformers/markdown-table-transformer';
import { TWEET } from '../components/transformers/markdown-tweet-transformer';
import { MENTION_MARKDOWN_TRANSFORMER } from '../components/transformers/markdown-mention-transformer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import EditorMethods from '../components/shared/EditorMethods';

export interface PluginOptions {
    history?: boolean;
    autoFocus?: boolean;
    richText?: boolean;
    checkList?: boolean;
    horizontalRule?: boolean;
    table?: boolean;
    list?: boolean;
    tabIndentation?: boolean;
    draggableBlock?: boolean;
    images?: boolean;
    codeHighlight?: boolean;
    autoLink?: boolean;
    link?: boolean;
    componentPicker?: boolean;
    contextMenu?: boolean;
    dragDropPaste?: boolean;
    emojiPicker?: boolean;
    floatingLinkEditor?: boolean;
    floatingTextFormat?: boolean;
    maxIndentLevel?: boolean;
    beautifulMentions?: boolean;
    showToolbar?: boolean;
    showBottomBar?: boolean;
    quote?: boolean;

    toolbar?: {
        history?: boolean;
        blockFormat?: boolean;
        codeLanguage?: boolean;
        fontFormat?: {
            bold?: boolean;
            italic?: boolean;
            underline?: boolean;
            strikethrough?: boolean;
        };
        link?: boolean;
        clearFormatting?: boolean;
        horizontalRule?: boolean;
        image?: boolean;
        table?: boolean;
        quote?: boolean;
    };

    actionBar?: {
        maxLength?: boolean;
        characterLimit?: boolean;
        counter?: boolean;
        speechToText?: boolean;
        editModeToggle?: boolean;
        clearEditor?: boolean;
        treeView?: boolean;
    };

    [key: string]: any;
}

const editorConfig: InitialConfigType = {
    namespace: 'Editor',
    theme: editorTheme,
    nodes,
    onError: (error: Error) => {
        console.error(error);
    },
};

function LoadMarkdownContent({
    initialMarkdown,
    transformers,
}: {
    initialMarkdown: string;
    transformers: any[];
}) {
    const initializedRef = useRef(false);
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!initializedRef.current) {
            editor.update(() => {
                if (initialMarkdown) {
                    $convertFromMarkdownString(initialMarkdown, transformers);
                } else {
                    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                }
            });
            initializedRef.current = true;
        }
    }, []);

    return null;
}

export function ChatEditor({
    onChange,
    onSerializedChange,
    pluginOptions = {},
    maxLength = 5000,
    height = '70vh',
    maxHeight = '200px',
    onMentionSearch,
    onImageUpload,
    onAIGeneration,
    mentionMenu,
    mentionMenuItem,
    onMarkdownChange,
    initialMarkdown,
    placeholder,
    editorRef,
    onKeyDown,
}: {
    onChange?: (editorState: EditorState) => void;
    onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
    pluginOptions?: PluginOptions;
    maxLength?: number;
    height?: string;
    maxHeight?: string;
    showBottomBar?: boolean;
    onMentionSearch?: (
        trigger: string,
        query?: string | null,
    ) => Promise<any[]>;
    onImageUpload?: (file: File) => Promise<any | { url: string }>;
    onAIGeneration?: (
        prompt: string,
        transformType: string,
    ) => Promise<{ text: string; success: boolean; error?: string }>;
    mentionMenu?: React.FC<any>;
    mentionMenuItem?: React.FC<any>;
    onMarkdownChange?: (markdown: string) => void;
    initialMarkdown?: string;
    placeholder?: string;
    editorRef?: React.RefObject<any>;
    onKeyDown?: (event: React.KeyboardEvent) => void;
}) {
    const TRANSFORMERS = [
        MENTION_MARKDOWN_TRANSFORMER,
        TABLE,
        HR,
        IMAGE,
        EMOJI,
        EQUATION,
        TWEET,
        CHECK_LIST,
        ...ELEMENT_TRANSFORMERS,
        ...MULTILINE_ELEMENT_TRANSFORMERS,
        ...TEXT_FORMAT_TRANSFORMERS,
        ...TEXT_MATCH_TRANSFORMERS,
    ];

    const editorState: EditorState | undefined = undefined;
    const editorSerializedState: SerializedEditorState | undefined = undefined;

    const containerStyle = {
        height,
        ...(maxHeight ? { maxHeight } : {}),
    };

    return (
        <div className='overflow-hidden flex flex-col' style={containerStyle}>
            <LexicalComposer
                initialConfig={{
                    ...editorConfig,
                    ...(editorState ? { editorState } : {}),
                    ...(editorSerializedState
                        ? { editorState: JSON.stringify(editorSerializedState) }
                        : {}),
                }}
            >
                <TooltipProvider
                // initialMarkdown={initialMarkdown}
                // transformers={TRANSFORMERS}
                >
                    <EditorMethods
                        initialMarkdown={initialMarkdown}
                        transformers={TRANSFORMERS}
                        ref={editorRef}
                    />
                    <SharedAutocompleteContext>
                        <FloatingLinkContext>
                            <div className='flex flex-col h-full'>
                                <Plugins
                                    onKeyDown={onKeyDown}
                                    maxLength={maxLength}
                                    pluginOptions={pluginOptions}
                                    onMentionSearch={onMentionSearch}
                                    onImageUpload={onImageUpload}
                                    onAIGeneration={onAIGeneration}
                                    mentionMenu={mentionMenu}
                                    mentionMenuItem={mentionMenuItem}
                                    placeholder={placeholder}
                                />
                            </div>
                            <OnChangePlugin
                                ignoreSelectionChange={true}
                                onChange={(editorState) => {
                                    onChange?.(editorState);
                                    onSerializedChange?.(editorState.toJSON());
                                    let markdown = '';
                                    editorState.read(() => {
                                        markdown = $convertToMarkdownString(
                                            TRANSFORMERS,
                                            undefined,
                                            true,
                                        );
                                    });

                                    onMarkdownChange?.(markdown);
                                }}
                            />
                        </FloatingLinkContext>
                    </SharedAutocompleteContext>
                </TooltipProvider>
            </LexicalComposer>
        </div>
    );
}

'use client';

import {
    InitialConfigType,
    LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState, SerializedEditorState } from 'lexical';

import { FloatingLinkContext } from '../components/context/floating-link-context';
import { SharedAutocompleteContext } from '../components/context/shared-autocomplete-context';
import { editorTheme } from '../components/themes/editor-theme';
import { TooltipProvider } from '../ui/tooltip';

import { nodes } from './nodes';
import { Plugins } from './plugins';
import { cn } from '@/lib/utils';
import EditorMethods from '../components/shared/EditorMethods';

// In editor.ts or editor.tsx file

export interface PluginOptions {
    // Main plugin options
    history?: boolean;
    autoFocus?: boolean;
    richText?: boolean;
    checkList?: boolean;
    horizontalRule?: boolean;
    table?: boolean;
    list?: boolean;
    tabIndentation?: boolean;
    hashtag?: boolean;
    mentions?: boolean;
    draggableBlock?: boolean;
    images?: boolean;
    inlineImage?: boolean;
    excalidraw?: boolean;
    poll?: boolean;
    equations?: boolean;
    autoEmbed?: boolean;
    figma?: boolean;
    twitter?: boolean;
    youtube?: boolean;
    codeHighlight?: boolean;
    markdownShortcut?: boolean;
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

    // Toolbar-specific options
    toolbar?: {
        history?: boolean;
        blockFormat?: boolean;
        codeLanguage?: boolean;
        fontFamily?: boolean;
        fontSize?: boolean;
        fontFormat?: {
            bold?: boolean;
            italic?: boolean;
            underline?: boolean;
            strikethrough?: boolean;
        };
        subSuper?: boolean;
        link?: boolean;
        clearFormatting?: boolean;
        fontColor?: boolean;
        fontBackground?: boolean;
        elementFormat?: boolean;
        blockInsert?: {
            horizontalRule?: boolean;
            pageBreak?: boolean;
            image?: boolean;
            inlineImage?: boolean;
            collapsible?: boolean;
            excalidraw?: boolean;
            table?: boolean;
            poll?: boolean;
            columnsLayout?: boolean;
            embeds?: boolean;
        };
    };

    // Action bar specific options
    actionBar?: {
        maxLength?: boolean;
        characterLimit?: boolean;
        counter?: boolean;
        speechToText?: boolean;
        shareContent?: boolean;
        markdownToggle?: boolean;
        editModeToggle?: boolean;
        clearEditor?: boolean;
        treeView?: boolean;
    };

    [key: string]: any; // To allow for future extensions
}

const editorConfig: InitialConfigType = {
    namespace: 'Editor',
    theme: editorTheme,
    nodes,
    onError: (error: Error) => {
        console.error(error);
    },
};

export function Editor({
    editorState,
    editorSerializedState,
    onChange,
    onSerializedChange,
    pluginOptions = {}, // Add the pluginOptions prop with empty default
    maxLength = 5000,
    height = '70vh',
    onMentionSearch,
    onImageUpload,
    onAIGeneration,
    mentionMenu,
    mentionMenuItem,
    className,
    placeholder,
    editorRef,
}: {
    editorState?: EditorState;
    editorSerializedState?: SerializedEditorState;
    onChange?: (editorState: EditorState) => void;
    onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
    pluginOptions?: PluginOptions;
    maxLength?: number;
    height?: string;
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
    className?: string;
    placeholder?: string;
    editorRef?: React.Ref<any>;
}) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg border bg-background shadow flex flex-col',
                className,
            )}
            style={{ height }}
        >
            <LexicalComposer
                initialConfig={{
                    ...editorConfig,
                    ...(editorState ? { editorState } : {}),
                    ...(editorSerializedState
                        ? { editorState: JSON.stringify(editorSerializedState) }
                        : {}),
                }}
            >
                <TooltipProvider>
                    <EditorMethods
                        // initialMarkdown={initialMarkdown}
                        // transformers={TRANSFORMERS}
                        ref={editorRef}
                    />
                    <SharedAutocompleteContext>
                        <FloatingLinkContext>
                            <div className='flex flex-col h-full'>
                                <Plugins
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
                                }}
                            />
                        </FloatingLinkContext>
                    </SharedAutocompleteContext>
                </TooltipProvider>
            </LexicalComposer>
        </div>
    );
}

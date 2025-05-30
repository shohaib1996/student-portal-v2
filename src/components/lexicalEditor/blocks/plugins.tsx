import { useCallback, useState } from 'react';
import {
    CHECK_LIST,
    ELEMENT_TRANSFORMERS,
    MULTILINE_ELEMENT_TRANSFORMERS,
    TEXT_FORMAT_TRANSFORMERS,
    TEXT_MATCH_TRANSFORMERS,
} from '@lexical/markdown';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';

import { Separator } from '../ui/separator';

import { BlockFormatDropDown } from '../components/plugins/toolbar/block-format-toolbar-plugin';
import { FormatBulletedList } from '../components/plugins/toolbar/block-format/format-bulleted-list';
import { FormatCheckList } from '../components/plugins/toolbar/block-format/format-check-list';
import { FormatCodeBlock } from '../components/plugins/toolbar/block-format/format-code-block';
import { FormatHeading } from '../components/plugins/toolbar/block-format/format-heading';
import { FormatNumberedList } from '../components/plugins/toolbar/block-format/format-numbered-list';
import { FormatParagraph } from '../components/plugins/toolbar/block-format/format-paragraph';
import { FormatQuote } from '../components/plugins/toolbar/block-format/format-quote';
import { BlockInsertPlugin } from '../components/plugins/toolbar/block-insert-plugin';
import { InsertCollapsibleContainer } from '../components/plugins/toolbar/block-insert/insert-collapsible-container';
import { InsertColumnsLayout } from '../components/plugins/toolbar/block-insert/insert-columns-layout';
import { InsertEmbeds } from '../components/plugins/toolbar/block-insert/insert-embeds';
import { InsertExcalidraw } from '../components/plugins/toolbar/block-insert/insert-excalidraw';
import { InsertHorizontalRule } from '../components/plugins/toolbar/block-insert/insert-horizontal-rule';
import { InsertImage } from '../components/plugins/toolbar/block-insert/insert-image';
import { InsertInlineImage } from '../components/plugins/toolbar/block-insert/insert-inline-image';
import { InsertPageBreak } from '../components/plugins/toolbar/block-insert/insert-page-break';
import { InsertPoll } from '../components/plugins/toolbar/block-insert/insert-poll';
import { InsertTable } from '../components/plugins/toolbar/block-insert/insert-table';
import { ClearFormattingToolbarPlugin } from '../components/plugins/toolbar/clear-formatting-toolbar-plugin';
import { CodeLanguageToolbarPlugin } from '../components/plugins/toolbar/code-language-toolbar-plugin';
import { ElementFormatToolbarPlugin } from '../components/plugins/toolbar/element-format-toolbar-plugin';
import { FontBackgroundToolbarPlugin } from '../components/plugins/toolbar/font-background-toolbar-plugin';
import { FontColorToolbarPlugin } from '../components/plugins/toolbar/font-color-toolbar-plugin';
import { FontFamilyToolbarPlugin } from '../components/plugins/toolbar/font-family-toolbar-plugin';
import { FontFormatToolbarPlugin } from '../components/plugins/toolbar/font-format-toolbar-plugin';
import { FontSizeToolbarPlugin } from '../components/plugins/toolbar/font-size-toolbar-plugin';
import { HistoryToolbarPlugin } from '../components/plugins/toolbar/history-toolbar-plugin';
import { LinkToolbarPlugin } from '../components/plugins/toolbar/link-toolbar-plugin';
import { SubSuperToolbarPlugin } from '../components/plugins/toolbar/subsuper-toolbar-plugin';

import { ActionsPlugin } from '../components/plugins/actions/actions-plugin';
import { CharacterLimitPlugin } from '../components/plugins/actions/character-limit-plugin';
import { ClearEditorActionPlugin } from '../components/plugins/actions/clear-editor-plugin';
import { CounterCharacterPlugin } from '../components/plugins/actions/counter-character-plugin';
import { EditModeTogglePlugin } from '../components/plugins/actions/edit-mode-toggle-plugin';
import { ImportExportPlugin } from '../components/plugins/actions/import-export-plugin';
import { MarkdownTogglePlugin } from '../components/plugins/actions/markdown-toggle-plugin';
import { MaxLengthPlugin } from '../components/plugins/actions/max-length-plugin';
import { ShareContentPlugin } from '../components/plugins/actions/share-content-plugin';
import { SpeechToTextPlugin } from '../components/plugins/actions/speech-to-text-plugin';
import { TreeViewPlugin } from '../components/plugins/actions/tree-view-plugin';
import { AutoLinkPlugin } from '../components/plugins/auto-link-plugin';
import { AutocompletePlugin } from '../components/plugins/autocomplete-plugin';
import { CodeActionMenuPlugin } from '../components/plugins/code-action-menu-plugin';
import { CodeHighlightPlugin } from '../components/plugins/code-highlight-plugin';
import { CollapsiblePlugin } from '../components/plugins/collapsible-plugin';
import { ComponentPickerMenuPlugin } from '../components/plugins/component-picker-menu-plugin';
import { ContextMenuPlugin } from '../components/plugins/context-menu-plugin';
import { DragDropPastePlugin } from '../components/plugins/drag-drop-paste-plugin';
import { DraggableBlockPlugin } from '../components/plugins/draggable-block-plugin';
import { AutoEmbedPlugin } from '../components/plugins/embeds/auto-embed-plugin';
import { FigmaPlugin } from '../components/plugins/embeds/figma-plugin';
import { TwitterPlugin } from '../components/plugins/embeds/twitter-plugin';
import { YouTubePlugin } from '../components/plugins/embeds/youtube-plugin';
import { EmojiPickerPlugin } from '../components/plugins/emoji-picker-plugin';
import { EmojisPlugin } from '../components/plugins/emojis-plugin';
import { EquationsPlugin } from '../components/plugins/equations-plugin';
import { ExcalidrawPlugin } from '../components/plugins/excalidraw-plugin';
import { FloatingLinkEditorPlugin } from '../components/plugins/floating-link-editor-plugin';
import { FloatingTextFormatToolbarPlugin } from '../components/plugins/floating-text-format-plugin';
import { ImagesPlugin } from '../components/plugins/images-plugin';
import { InlineImagePlugin } from '../components/plugins/inline-image-plugin';
import { KeywordsPlugin } from '../components/plugins/keywords-plugin';
import { LayoutPlugin } from '../components/plugins/layout-plugin';
import { LinkPlugin } from '../components/plugins/link-plugin';
import { ListMaxIndentLevelPlugin } from '../components/plugins/list-max-indent-level-plugin';
import { MentionsPlugin } from '../components/plugins/mentions-plugin';
import { PageBreakPlugin } from '../components/plugins/page-break-plugin';
import { PollPlugin } from '../components/plugins/poll-plugin';
import { TabFocusPlugin } from '../components/plugins/tab-focus-plugin';
import { TableActionMenuPlugin } from '../components/plugins/table-action-menu-plugin';
import { TableCellResizerPlugin } from '../components/plugins/table-cell-resizer-plugin';
import { TableHoverActionsPlugin } from '../components/plugins/table-hover-actions-plugin';
import { ToolbarPlugin } from '../components/plugins/toolbar/toolbar-plugin';
import { TypingPerfPlugin } from '../components/plugins/typing-pref-plugin';
import { ContentEditable } from '../components/editor-ui/content-editable';

import { AlignmentPickerPlugin } from '../components/plugins/picker/alignment-picker-plugin';
import { ParagraphPickerPlugin } from '../components/plugins/picker/paragraph-picker-plugin';
import { HeadingPickerPlugin } from '../components/plugins/picker/heading-picker-plugin';
import {
    DynamicTablePickerPlugin,
    TablePickerPlugin,
} from '../components/plugins/picker/table-picker-plugin';
import { EmbedsPickerPlugin } from '../components/plugins/picker/embeds-picker-plugin';
import { CheckListPickerPlugin } from '../components/plugins/picker/check-list-picker-plugin';
import { NumberedListPickerPlugin } from '../components/plugins/picker/numbered-list-picker-plugin';
import { BulletedListPickerPlugin } from '../components/plugins/picker/bulleted-list-picker-plugin';
import { QuotePickerPlugin } from '../components/plugins/picker/quote-picker-plugin';
import { CodePickerPlugin } from '../components/plugins/picker/code-picker-plugin';
import { DividerPickerPlugin } from '../components/plugins/picker/divider-picker-plugin';
import { PageBreakPickerPlugin } from '../components/plugins/picker/page-break-picker-plugin';
import { ImagePickerPlugin } from '../components/plugins/picker/image-picker-plugin';
import { ExcalidrawPickerPlugin } from '../components/plugins/picker/excalidraw-picker-plugin';
import { PollPickerPlugin } from '../components/plugins/picker/poll-picker-plugin';
import { EquationPickerPlugin } from '../components/plugins/picker/equation-picker-plugin';
import { CollapsiblePickerPlugin } from '../components/plugins/picker/collapsible-picker-plugin';
import { ColumnsLayoutPickerPlugin } from '../components/plugins/picker/columns-layout-picker-plugin';

import { EMOJI } from '../components/transformers/markdown-emoji-transformer';
import { EQUATION } from '../components/transformers/markdown-equation-transofrmer';
import { HR } from '../components/transformers/markdown-hr-transformer';
import { IMAGE } from '../components/transformers/markdown-image-transformer';
import { TABLE } from '../components/transformers/markdown-table-transformer';
import { TWEET } from '../components/transformers/markdown-tweet-transformer';

import { BeautifulMentionsPlugin } from '../components/plugins/beautiful-mention';

import { PluginOptions } from './editor';

export function Plugins({
    maxLength,
    pluginOptions = {},
    onMentionSearch,
    onImageUpload,
    onAIGeneration,
    mentionMenu,
    mentionMenuItem,
    placeholder,
}: {
    maxLength?: number;
    pluginOptions?: PluginOptions;
    onMentionSearch?: (
        trigger: string,
        query?: string | null,
    ) => Promise<any[]>;
    onImageUpload?: (file: File) => Promise<any | { url: string }>;
    onAIGeneration?: (
        prompt: string,
        transformType: string,
    ) => Promise<{ text: string; success: boolean; error?: string }>;
    mentionMenu?: React.ComponentType<any>;
    mentionMenuItem?: React.ComponentType<any>;
    placeholder?: string;
}) {
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    // Use the provided onMentionSearch or fall back to default implementation
    const queryMentions = async (
        trigger: string,
        queryString?: string | null,
    ) => {
        if (onMentionSearch) {
            return onMentionSearch(trigger, queryString);
        }
    };

    // Option 1: Use type assertion with 'as any'
    const isToolbarOptionEnabled = (
        option: string,
        subOption?: string,
        subSubOption?: string,
    ): boolean => {
        if (!pluginOptions.toolbar) {
            return true;
        } // If toolbar options not specified, default to enabled

        if (subSubOption && subOption) {
            // Handle deeply nested options like toolbar.blockInsert.horizontalRule
            return (
                (pluginOptions.toolbar as any)[option]?.[subOption]?.[
                    subSubOption
                ] !== false
            );
        } else if (subOption) {
            // Handle nested options like toolbar.fontFormat.bold
            return (
                (pluginOptions.toolbar as any)[option]?.[subOption] !== false
            );
        } else {
            // Handle top-level options like toolbar.history
            return (pluginOptions.toolbar as any)[option] !== false;
        }
    };

    // Helper function to check if an action bar option is enabled
    const isActionBarOptionEnabled = (option: string): boolean => {
        if (!pluginOptions.actionBar) {
            return true;
        } // If actionBar options not specified, default to enabled
        return (pluginOptions.actionBar as any)[option] !== false;
    };

    return (
        <div className='relative flex flex-col h-full min-h-52'>
            {pluginOptions.showToolbar !== false && (
                <ToolbarPlugin>
                    {({ blockType }) => (
                        <div className='vertical-align-middle sticky top-0 flex gap-2 overflow-auto border-b p-1'>
                            {pluginOptions.history !== false &&
                                isToolbarOptionEnabled('history') && (
                                    <HistoryToolbarPlugin />
                                )}
                            <Separator orientation='vertical' className='h-8' />
                            {isToolbarOptionEnabled('blockFormat') && (
                                <BlockFormatDropDown>
                                    <FormatParagraph />
                                    <FormatHeading
                                        levels={['h1', 'h2', 'h3']}
                                    />
                                    <FormatNumberedList />
                                    <FormatBulletedList />
                                    <FormatCheckList />
                                    <FormatCodeBlock />
                                    <FormatQuote />
                                </BlockFormatDropDown>
                            )}
                            {blockType === 'code' ? (
                                isToolbarOptionEnabled('codeLanguage') && (
                                    <CodeLanguageToolbarPlugin />
                                )
                            ) : (
                                <>
                                    {isToolbarOptionEnabled('fontFamily') && (
                                        <FontFamilyToolbarPlugin />
                                    )}
                                    {isToolbarOptionEnabled('fontSize') && (
                                        <FontSizeToolbarPlugin />
                                    )}
                                    <Separator
                                        orientation='vertical'
                                        className='h-8'
                                    />
                                    {isToolbarOptionEnabled(
                                        'fontFormat',
                                        'bold',
                                    ) && (
                                        <FontFormatToolbarPlugin format='bold' />
                                    )}
                                    {isToolbarOptionEnabled(
                                        'fontFormat',
                                        'italic',
                                    ) && (
                                        <FontFormatToolbarPlugin format='italic' />
                                    )}
                                    {isToolbarOptionEnabled(
                                        'fontFormat',
                                        'underline',
                                    ) && (
                                        <FontFormatToolbarPlugin format='underline' />
                                    )}
                                    {isToolbarOptionEnabled(
                                        'fontFormat',
                                        'strikethrough',
                                    ) && (
                                        <FontFormatToolbarPlugin format='strikethrough' />
                                    )}

                                    <Separator
                                        orientation='vertical'
                                        className='h-8'
                                    />
                                    {isToolbarOptionEnabled('subSuper') && (
                                        <SubSuperToolbarPlugin />
                                    )}
                                    {isToolbarOptionEnabled('link') && (
                                        <LinkToolbarPlugin />
                                    )}
                                    <Separator
                                        orientation='vertical'
                                        className='h-8'
                                    />
                                    {isToolbarOptionEnabled(
                                        'clearFormatting',
                                    ) && <ClearFormattingToolbarPlugin />}
                                    <Separator
                                        orientation='vertical'
                                        className='h-8'
                                    />
                                    {isToolbarOptionEnabled('fontColor') && (
                                        <FontColorToolbarPlugin />
                                    )}
                                    {isToolbarOptionEnabled(
                                        'fontBackground',
                                    ) && <FontBackgroundToolbarPlugin />}
                                    <Separator
                                        orientation='vertical'
                                        className='h-8'
                                    />
                                    {isToolbarOptionEnabled(
                                        'elementFormat',
                                    ) && <ElementFormatToolbarPlugin />}
                                    <Separator
                                        orientation='vertical'
                                        className='h-8'
                                    />
                                    <BlockInsertPlugin>
                                        {pluginOptions.horizontalRule !==
                                            false &&
                                            isToolbarOptionEnabled(
                                                'blockInsert',
                                                'horizontalRule',
                                            ) && <InsertHorizontalRule />}
                                        {isToolbarOptionEnabled(
                                            'blockInsert',
                                            'pageBreak',
                                        ) && <InsertPageBreak />}
                                        {pluginOptions.images !== false &&
                                            isToolbarOptionEnabled(
                                                'blockInsert',
                                                'image',
                                            ) && (
                                                <InsertImage
                                                    onImageUpload={
                                                        onImageUpload as any
                                                    }
                                                />
                                            )}
                                        {pluginOptions.inlineImage !== false &&
                                            isToolbarOptionEnabled(
                                                'blockInsert',
                                                'inlineImage',
                                            ) && (
                                                <InsertInlineImage
                                                    onImageUpload={
                                                        onImageUpload as any
                                                    }
                                                />
                                            )}
                                        {isToolbarOptionEnabled(
                                            'blockInsert',
                                            'collapsible',
                                        ) && <InsertCollapsibleContainer />}
                                        {pluginOptions.excalidraw !== false &&
                                            isToolbarOptionEnabled(
                                                'blockInsert',
                                                'excalidraw',
                                            ) && <InsertExcalidraw />}
                                        {pluginOptions.table !== false &&
                                            isToolbarOptionEnabled(
                                                'blockInsert',
                                                'table',
                                            ) && <InsertTable />}
                                        {pluginOptions.poll !== false &&
                                            isToolbarOptionEnabled(
                                                'blockInsert',
                                                'poll',
                                            ) && <InsertPoll />}
                                        {isToolbarOptionEnabled(
                                            'blockInsert',
                                            'columnsLayout',
                                        ) && <InsertColumnsLayout />}
                                        {isToolbarOptionEnabled(
                                            'blockInsert',
                                            'embeds',
                                        ) && <InsertEmbeds />}
                                    </BlockInsertPlugin>
                                </>
                            )}
                        </div>
                    )}
                </ToolbarPlugin>
            )}

            <div className='relative flex-1 flex flex-col min-h-52'>
                {pluginOptions.beautifulMentions !== false && (
                    <BeautifulMentionsPlugin
                        triggers={['@']}
                        onSearch={queryMentions as any}
                        menuComponent={mentionMenu}
                        menuItemComponent={mentionMenuItem}
                        allowSpaces
                        autoSpace
                    />
                )}

                {pluginOptions.autoFocus !== false && <AutoFocusPlugin />}

                {pluginOptions.richText !== false && (
                    <RichTextPlugin
                        contentEditable={
                            <div className='absolute inset-0 overflow-hidden'>
                                <div
                                    ref={onRef}
                                    className='h-full w-full overflow-hidden'
                                >
                                    <ContentEditable
                                        placeholder={
                                            placeholder || 'Write something'
                                        }
                                        className='ContentEditable__root h-full w-full overflow-auto px-4 py-2 focus:outline-none'
                                    />
                                </div>
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                )}

                <ClickableLinkPlugin />
                {pluginOptions.checkList !== false && <CheckListPlugin />}
                {pluginOptions.horizontalRule !== false && (
                    <HorizontalRulePlugin />
                )}
                {pluginOptions.table !== false && <TablePlugin />}
                {pluginOptions.list !== false && <ListPlugin />}
                {pluginOptions.tabIndentation !== false && (
                    <TabIndentationPlugin />
                )}
                {pluginOptions.hashtag !== false && <HashtagPlugin />}
                {pluginOptions.history !== false && <HistoryPlugin />}

                <PageBreakPlugin />
                {pluginOptions.draggableBlock !== false && (
                    <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                )}
                <KeywordsPlugin />
                <EmojisPlugin />
                {pluginOptions.images !== false && <ImagesPlugin />}
                {pluginOptions.inlineImage !== false && <InlineImagePlugin />}
                {pluginOptions.excalidraw !== false && <ExcalidrawPlugin />}

                {pluginOptions.table !== false && (
                    <>
                        <TableCellResizerPlugin />
                        <TableHoverActionsPlugin
                            anchorElem={floatingAnchorElem}
                        />
                        <TableActionMenuPlugin
                            anchorElem={floatingAnchorElem}
                            cellMerge={true}
                        />
                    </>
                )}

                {pluginOptions.poll !== false && <PollPlugin />}
                <LayoutPlugin />
                {pluginOptions.equations !== false && <EquationsPlugin />}
                <CollapsiblePlugin />

                {pluginOptions.autoEmbed !== false && <AutoEmbedPlugin />}
                {pluginOptions.figma !== false && <FigmaPlugin />}
                {pluginOptions.twitter !== false && <TwitterPlugin />}
                {pluginOptions.youtube !== false && <YouTubePlugin />}

                {pluginOptions.codeHighlight !== false && (
                    <CodeHighlightPlugin />
                )}
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />

                {pluginOptions.markdownShortcut !== false && (
                    <MarkdownShortcutPlugin
                        transformers={[
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
                        ]}
                    />
                )}

                <TabFocusPlugin />
                <AutocompletePlugin />
                {pluginOptions.autoLink !== false && <AutoLinkPlugin />}
                {pluginOptions.link !== false && <LinkPlugin />}

                {pluginOptions.componentPicker !== false && (
                    <ComponentPickerMenuPlugin
                        baseOptions={[
                            ParagraphPickerPlugin(),
                            HeadingPickerPlugin({ n: 1 }),
                            HeadingPickerPlugin({ n: 2 }),
                            HeadingPickerPlugin({ n: 3 }),
                            TablePickerPlugin(),
                            CheckListPickerPlugin(),
                            NumberedListPickerPlugin(),
                            BulletedListPickerPlugin(),
                            QuotePickerPlugin(),
                            CodePickerPlugin(),
                            DividerPickerPlugin(),
                            PageBreakPickerPlugin(),
                            ExcalidrawPickerPlugin(),
                            PollPickerPlugin(),
                            EmbedsPickerPlugin({ embed: 'figma' }),
                            EmbedsPickerPlugin({ embed: 'tweet' }),
                            EmbedsPickerPlugin({ embed: 'youtube-video' }),
                            EquationPickerPlugin(),
                            ImagePickerPlugin(onImageUpload as any),
                            CollapsiblePickerPlugin(),
                            ColumnsLayoutPickerPlugin(),
                            AlignmentPickerPlugin({ alignment: 'left' }),
                            AlignmentPickerPlugin({ alignment: 'center' }),
                            AlignmentPickerPlugin({ alignment: 'right' }),
                            AlignmentPickerPlugin({ alignment: 'justify' }),
                        ]}
                        dynamicOptionsFn={DynamicTablePickerPlugin}
                    />
                )}

                {pluginOptions.contextMenu !== false && <ContextMenuPlugin />}
                {pluginOptions.dragDropPaste !== false && (
                    <DragDropPastePlugin />
                )}
                {pluginOptions.emojiPicker !== false && <EmojiPickerPlugin />}

                {pluginOptions.floatingLinkEditor !== false && (
                    <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                )}
                {pluginOptions.floatingTextFormat !== false && (
                    <FloatingTextFormatToolbarPlugin
                        anchorElem={floatingAnchorElem}
                        onAIGeneration={onAIGeneration}
                    />
                )}

                {pluginOptions.maxIndentLevel !== false && (
                    <ListMaxIndentLevelPlugin />
                )}
            </div>

            {pluginOptions.showBottomBar && (
                <ActionsPlugin>
                    <div className='clear-both flex items-center justify-between border-t p-1 overflow-auto gap-2'>
                        <div className='flex justify-start flex-1'>
                            {isActionBarOptionEnabled('maxLength') && (
                                <MaxLengthPlugin
                                    maxLength={maxLength as number}
                                />
                            )}
                            {isActionBarOptionEnabled('characterLimit') && (
                                <CharacterLimitPlugin
                                    maxLength={maxLength as number}
                                    charset='UTF-16'
                                />
                            )}
                        </div>
                        <div>
                            {isActionBarOptionEnabled('counter') && (
                                <CounterCharacterPlugin charset='UTF-16' />
                            )}
                        </div>
                        <div className='flex justify-end flex-1'>
                            {isActionBarOptionEnabled('speechToText') && (
                                <SpeechToTextPlugin />
                            )}
                            {isActionBarOptionEnabled('shareContent') && (
                                <ShareContentPlugin />
                            )}
                            {isActionBarOptionEnabled('markdownToggle') && (
                                <MarkdownTogglePlugin
                                    shouldPreserveNewLinesInMarkdown={true}
                                    transformers={[
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
                                    ]}
                                />
                            )}
                            {isActionBarOptionEnabled('editModeToggle') && (
                                <EditModeTogglePlugin />
                            )}
                            {isActionBarOptionEnabled('clearEditor') && (
                                <>
                                    <ClearEditorActionPlugin />
                                    <ClearEditorPlugin />
                                </>
                            )}
                            {isActionBarOptionEnabled('treeView') && (
                                <TreeViewPlugin />
                            )}
                        </div>
                    </div>
                </ActionsPlugin>
            )}
        </div>
    );
}

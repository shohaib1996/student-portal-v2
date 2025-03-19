'use client';
// InitializedMDXEditor.tsx

import '@mdxeditor/editor/style.css';

import type { ForwardedRef } from 'react';
import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    directivesPlugin,
    AdmonitionDirectiveDescriptor,
    frontmatterPlugin,
    InsertThematicBreak,
    ListsToggle,
    imagePlugin,
    InsertTable,
    tablePlugin,
    InsertImage,
} from '@mdxeditor/editor';
import { instance } from '@/lib/axios/axiosInstance';

// Only import this to the next file
export default function MarkdownEditorInitializer({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    const imageUploadHandler = async (image: File) => {
        try {
            const formData = new FormData();
            formData.append('image', image, image.name);
            formData.append('path', 'content-image');

            const response = await instance.post(
                '/settings/watermark-image',
                formData,
            );
            return response.data.url;
        } catch (error) {
            console.error('Image upload failed:', error);
            return null;
        }
    };

    return (
        <MDXEditor
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                imagePlugin({
                    imageUploadHandler,
                }),
                directivesPlugin({
                    directiveDescriptors: [AdmonitionDirectiveDescriptor],
                }),
                frontmatterPlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                tablePlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <div className='flex w-full gap-3 bg-lavender-mist py-1 text-gray'>
                            <UndoRedo />
                            <BoldItalicUnderlineToggles />
                            {/* <ChangeAdmonitionType /> */}
                            <InsertImage />
                            <BlockTypeSelect />
                            <InsertTable />
                            <InsertThematicBreak />
                            <ListsToggle />
                        </div>
                    ),
                }),
            ]}
            {...props}
            ref={editorRef}
        />
    );
}

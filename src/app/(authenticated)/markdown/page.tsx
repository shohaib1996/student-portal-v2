'use client';

import { useState } from 'react';
import { SerializedEditorState } from 'lexical';
import {
    MarkdownEditor,
    PluginOptions,
} from '@/components/lexicalEditor/markdown/editor';
import axios from 'axios';
import {
    MentionMenu,
    MentionMenuItem,
} from '@/components/lexicalEditor/components/editor-ui/MentionMenu';

// Initial markdown content
const initialMarkdown =
    '# Hello, welcome to the powerful editor!\n\nThis is a markdown-based editor. You can use **bold**, *italic*, @[shimul](1) and other markdown features.\n\n- List item 1\n- List item 2';

export default function MinimalEditor() {
    // Store actual markdown content - this is what you'll use in your app
    const [markdownContent, setMarkdownContent] =
        useState<string>(initialMarkdown);

    // Define a minimal set of toolbar options
    const pluginOptions: PluginOptions = {
        // Main plugin options
        history: true,
        autoFocus: true,
        richText: true,
        checkList: true,
        horizontalRule: true,
        table: true,
        list: true,
        tabIndentation: true,
        draggableBlock: true,
        images: true,
        codeHighlight: true,
        autoLink: true,
        link: true,
        componentPicker: true,
        contextMenu: true,
        dragDropPaste: true,
        emojiPicker: true,
        floatingLinkEditor: true,
        floatingTextFormat: true,
        maxIndentLevel: true,
        beautifulMentions: true,
        showToolbar: true,
        showBottomBar: true,

        // Toolbar-specific options
        toolbar: {
            history: true,
            blockFormat: true,
            codeLanguage: true,
            fontFormat: {
                bold: true,
                italic: true,
                underline: true,
                strikethrough: true,
            },
            link: true,
            clearFormatting: true,
            blockInsert: {
                horizontalRule: true,
                image: true,
                table: true,
            },
        },

        // Action bar specific options
        actionBar: {
            maxLength: true,
            characterLimit: true,
            counter: true,
            speechToText: true,
            editModeToggle: true,
            clearEditor: true,
            treeView: true,
        },
    };

    // Custom image upload handler
    const handleImageUpload = async (file: File) => {
        console.log(`Uploading image: ${file.name}`);

        // Demo implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    url: URL.createObjectURL(file),
                });
            }, 1000);
        });
    };

    // Handle AI text generation
    const handleAIGeneration = async (
        prompt: string,
        transformType: string,
    ) => {
        console.log(
            `AI Generation request: ${transformType}, prompt: ${prompt}`,
        );

        // Example implementation - replace with your actual API call
        try {
            const response = await axios.post(
                'https://staging-api.bootcampshub.ai/api/organization/integration/generate-text',
                { prompt },
                {
                    headers: {
                        authorization: 'Bearer YOUR_TOKEN',
                        branch: 'YOUR_BRANCH_ID',
                    },
                },
            );

            const data = await response.data;

            if (data.success) {
                return { text: data.text, success: true };
            } else {
                console.error('AI generation failed:', data.error);
                return { text: '', success: false, error: data.error };
            }
        } catch (error) {
            console.error('Error calling AI generation API:', error);
            return {
                text: '',
                success: false,
                error: 'Failed to connect to AI service',
            };
        }
    };

    // Custom mention search handler
    const handleMentionSearch = async (
        trigger: string,
        query?: string | null,
    ) => {
        console.log(
            `Searching for mentions with trigger: ${trigger}, query: ${query}`,
        );

        // You can customize this to fetch from your own API
        const searchQuery = query || '';
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/users?trigger=${trigger}&query=${searchQuery}`,
        );
        const data = await response.json();

        return data?.map(
            (x: { name: string; id: string | number; avatar: string }) => ({
                value: x?.name,
                id: String(x?.id),
                avatar: x?.avatar || `https://placehold.co/400`,
            }),
        );
    };

    // Function to save markdown to your backend or elsewhere
    const saveMarkdown = () => {
        console.log('Saving markdown content:', markdownContent);
        // Here you would implement your save functionality
        // e.g., saveToDatabase(markdownContent);
    };

    return (
        <div className='flex flex-col h-screen'>
            <div className='flex-1'>
                <MarkdownEditor
                    height='100%'
                    initialMarkdown={markdownContent}
                    onMarkdownChange={(markdown) =>
                        setMarkdownContent(markdown)
                    }
                    pluginOptions={pluginOptions}
                    maxLength={50000}
                    onImageUpload={handleImageUpload}
                    onAIGeneration={handleAIGeneration}
                    onMentionSearch={handleMentionSearch}
                    mentionMenu={MentionMenu}
                    mentionMenuItem={MentionMenuItem}
                />
            </div>
        </div>
    );
}

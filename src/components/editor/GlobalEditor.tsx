'use client';

import { useEffect, useState } from 'react';
import { EditorState, SerializedEditorState } from 'lexical';
import axios from 'axios';
import {
    MarkdownEditor,
    PluginOptions,
} from '../lexicalEditor/markdown/editor';
import {
    MentionMenu,
    MentionMenuItem,
} from '../lexicalEditor/components/editor-ui/MentionMenu';

const initialValue = {
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Hello, welcome to the powerful editor!',
                        type: 'text',
                        version: 1,
                    },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
            },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    },
} as unknown as SerializedEditorState;

type TProps = {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    height?: string;
    className?: string;
    pluginOptions?: PluginOptions;
    placeholder?: string;
};

export default function GlobalEditor({
    value,
    onChange,
    maxLength = 5000,
    height = '100%',
    placeholder = 'Enter description',
    className,
    pluginOptions,
}: TProps) {
    const [editorState, setEditorState] = useState<string>(value);

    // Define a minimal set of toolbar options
    const defaultPluginOptions: PluginOptions = {
        // Enable only essential features
        history: true,
        autoFocus: true,
        richText: true,
        list: true,
        link: true,
        autoLink: true,

        // Disable features we don't need
        checkList: true,
        horizontalRule: true,
        table: true,
        excalidraw: true,
        poll: true,
        equations: true,
        autoEmbed: true,
        figma: true,
        twitter: true,
        youtube: true,
        draggableBlock: true,

        // Show toolbar but customize which buttons appear
        showToolbar: true,
        showBottomBar: false,
        floatingTextFormat: false,

        // Toolbar controls - only show basic formatting
        toolbar: {
            history: true,
            blockFormat: true,
            fontFormat: {
                bold: true,
                italic: true,
                underline: true, // Hide underline button
                strikethrough: true, // Hide strikethrough button
            },
            clearFormatting: true,
        },

        // Minimal bottom bar
        actionBar: {
            maxLength: true,
            characterLimit: true,
            counter: true,
            speechToText: true,
            // shareContent: true,
            // markdownToggle: true,
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
                        authorization:
                            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGVmNjc2NjY5ZWFmNjM3MGMxMTQyOWMiLCJlbWFpbCI6IjE4Nm1kc2hpbXVsQGdtYWlsLmNvbSIsImJyYW5jaCI6IjY0ZmNiNGU4OTQ0Y2YyMTVkOGQzMmY5NSIsIm9yZ2FuaXphdGlvbiI6IjY0ZmNiMmU2MGQyZjg3N2FhY2NiM2IyNiIsInNvdXJjZSI6ImJyYW5jaCIsImZpcnN0TmFtZSI6IkFzaHJhZnVsIiwibGFzdE5hbWUiOiJJc2xhbSIsInByb2ZpbGVQaWN0dXJlIjoiaHR0cHM6Ly90czR1cG9ydGFsLWFsbC1maWxlcy11cGxvYWQubnljMy5kaWdpdGFsb2NlYW5zcGFjZXMuY29tLzE3MTkzODA2Nzg2MTEtU2NyZWVuc2hvdC0yMDI0IiwiaWF0IjoxNzQ0MDU1MzI4LCJleHAiOjE3NDQ2NjAxMjh9.8T76uwuBuKr_qOCnKAe0b-npvE44RxlvlIbkSVKYxRI',
                        branch: '64fcb4e8944cf215d8d32f95',
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
                id: x?.id,
                avatar: x?.avatar || `https://placehold.co/400`,
            }),
        );
    };

    console.log(value);

    return (
        <MarkdownEditor
            height='100%'
            initialMarkdown={value}
            className={className}
            pluginOptions={defaultPluginOptions}
            onMentionSearch={handleMentionSearch}
            mentionMenu={MentionMenu}
            mentionMenuItem={MentionMenuItem}
            placeholder='Write something...'
        />
    );
}

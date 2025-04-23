'use client';

import { useEffect, useState } from 'react';
import { EditorState, SerializedEditorState } from 'lexical';
import { Editor, PluginOptions } from '../lexicalEditor/blocks/editor';
import {
    MentionMenu,
    MentionMenuItem,
} from '../lexicalEditor/components/editor-ui/MentionMenu';
import { instance } from '@/lib/axios/axiosInstance';
import { useUploadUserDocumentFileMutation } from '@/redux/api/documents/documentsApi';
import { convertToLexicalFormat } from '../lexicalEditor/lib/toJsonConverter';

type TProps = {
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
    height?: string;
    className?: string;
    pluginOptions?: PluginOptions;
    placeholder?: string;
};

export default function GlobalBlockEditor({
    value,
    onChange,
    maxLength = 50000,
    height = '100%',
    className,
    pluginOptions,
    placeholder = 'Write something',
}: TProps) {
    const [editorState, setEditorState] = useState<SerializedEditorState>();

    const [
        uploadUserDocumentFile,
        { isLoading: isUploading, isError, isSuccess, data },
    ] = useUploadUserDocumentFileMutation();

    useEffect(() => {
        if (value) {
            setEditorState(
                convertToLexicalFormat(value) as SerializedEditorState,
            );
        }
    }, [value]);
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
        showBottomBar: true,

        // Toolbar controls - only show basic formatting
        toolbar: {
            history: true,
            blockFormat: true,
            fontFamily: true, // Hide font family dropdown
            fontSize: true, // Hide font size dropdown

            // Only allow basic text formatting
            fontFormat: {
                bold: true,
                italic: true,
                underline: true, // Hide underline button
                strikethrough: true, // Hide strikethrough button
            },

            // Disable these buttons
            subSuper: true,
            clearFormatting: true,
            fontColor: true,
            fontBackground: true,
            elementFormat: true,

            // Only allow inserting basic elements
            blockInsert: {
                horizontalRule: true,
                pageBreak: true,
                image: true, // Allow images
                inlineImage: true,
                collapsible: true,
                excalidraw: true,
                table: true,
                poll: true,
                columnsLayout: true,
                embeds: true,
            },
        },

        // Minimal bottom bar
        actionBar: {
            maxLength: true,
            characterLimit: true,
            counter: true,
            speechToText: true,
            shareContent: false,
            markdownToggle: true,
            editModeToggle: true,
            clearEditor: true,
            treeView: false,
        },
    };

    // Custom image upload handler
    const handleImageUpload = async (file: File) => {
        // Demo implementation

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await uploadUserDocumentFile(formData).unwrap();
            return {
                url: response?.fileUrl,
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        // return new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve({
        //             url: URL.createObjectURL(file),
        //         });
        //     }, 1000);
        // });
    };

    // Handle AI text generation
    // const handleAIGeneration = async (
    //     prompt: string,
    //     transformType: string,
    // ) => {
    //     console.log(
    //         `AI Generation request: ${transformType}, prompt: ${prompt}`,
    //     );

    //     // Example implementation - replace with your actual API call
    //     try {
    //         const response = await axios.post(
    //             'https://staging-api.bootcampshub.ai/api/organization/integration/generate-text',
    //             { prompt },
    //             {
    //                 headers: {
    //                     authorization:
    //                         'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGVmNjc2NjY5ZWFmNjM3MGMxMTQyOWMiLCJlbWFpbCI6IjE4Nm1kc2hpbXVsQGdtYWlsLmNvbSIsImJyYW5jaCI6IjY0ZmNiNGU4OTQ0Y2YyMTVkOGQzMmY5NSIsIm9yZ2FuaXphdGlvbiI6IjY0ZmNiMmU2MGQyZjg3N2FhY2NiM2IyNiIsInNvdXJjZSI6ImJyYW5jaCIsImZpcnN0TmFtZSI6IkFzaHJhZnVsIiwibGFzdE5hbWUiOiJJc2xhbSIsInByb2ZpbGVQaWN0dXJlIjoiaHR0cHM6Ly90czR1cG9ydGFsLWFsbC1maWxlcy11cGxvYWQubnljMy5kaWdpdGFsb2NlYW5zcGFjZXMuY29tLzE3MTkzODA2Nzg2MTEtU2NyZWVuc2hvdC0yMDI0IiwiaWF0IjoxNzQ0MDU1MzI4LCJleHAiOjE3NDQ2NjAxMjh9.8T76uwuBuKr_qOCnKAe0b-npvE44RxlvlIbkSVKYxRI',
    //                     branch: '64fcb4e8944cf215d8d32f95',
    //                 },
    //             },
    //         );

    //         const data = await response.data;

    //         if (data.success) {
    //             return { text: data.text, success: true };
    //         } else {
    //             console.error('AI generation failed:', data.error);
    //             return { text: '', success: false, error: data.error };
    //         }
    //     } catch (error) {
    //         console.error('Error calling AI generation API:', error);
    //         return {
    //             text: '',
    //             success: false,
    //             error: 'Failed to connect to AI service',
    //         };
    //     }
    // };

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

        const response = await instance.post('/user/filter', {
            query: searchQuery,
        });
        const data = response.data?.users;

        return data?.map(
            (x: {
                fullName: string;
                _id: string | number;
                profilePicture: string;
            }) => ({
                value: x?.fullName,
                id: x?._id,
                avatar: x?.profilePicture || `https://placehold.co/400`,
            }),
        );
    };

    // console.log(value);

    return (
        <Editor
            // initialHtml={"<h1>hello</h1>"}
            onChange={(value) => {
                onChange(JSON.stringify(value));
                // setEditorState();
            }}
            className={className}
            height={height}
            placeholder={placeholder}
            editorSerializedState={editorState}
            onSerializedChange={(value) => {
                setEditorState(value);
                onChange(JSON.stringify(value));
            }}
            pluginOptions={defaultPluginOptions}
            maxLength={maxLength}
            onImageUpload={handleImageUpload}
            // onAIGeneration={handleAIGeneration}
            onMentionSearch={handleMentionSearch}
            mentionMenu={MentionMenu}
            mentionMenuItem={MentionMenuItem}
        />
    );
}

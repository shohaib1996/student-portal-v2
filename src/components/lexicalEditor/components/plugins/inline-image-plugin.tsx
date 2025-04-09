'use client';

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react';
import { useEffect, useRef, useState, JSX } from 'react';

// import '../nodes/inline-image-node.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
    $createParagraphNode,
    $createRangeSelection,
    $getSelection,
    $insertNodes,
    $isNodeSelection,
    $isRootOrShadowRoot,
    $setSelection,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    LexicalCommand,
    LexicalEditor,
    createCommand,
} from 'lexical';

import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';

import type { Position } from '../nodes/inline-image-node';
import {
    $createInlineImageNode,
    $isInlineImageNode,
    InlineImageNode,
    InlineImagePayload,
} from '../nodes/inline-image-node';
import { CAN_USE_DOM } from '../shared/can-use-dom';

export type InsertInlineImagePayload = Readonly<InlineImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
    CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_INLINE_IMAGE_COMMAND: LexicalCommand<InlineImagePayload> =
    createCommand('INSERT_INLINE_IMAGE_COMMAND');

/**
 * Default image upload handler that sends to the server
 * @param file The image file to upload
 * @returns Promise resolving to the URL of the uploaded image
 */
async function defaultUploadImageToServer(file: File): Promise<string> {
    try {
        // Create a FormData instance to send the file
        const formData = new FormData();
        formData.append('image', file);

        // Make the API request to your server endpoint
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        const data = await response.json();

        // Return the URL of the uploaded image from the server response
        return data.imageUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

export function InsertInlineImageDialog({
    activeEditor,
    onClose,
    onImageUpload,
}: {
    activeEditor: LexicalEditor;
    onClose: () => void;
    onImageUpload?: (file: File) => Promise<{ url: string }>;
}): JSX.Element {
    const hasModifier = useRef(false);

    const [src, setSrc] = useState('');
    const [altText, setAltText] = useState('');
    const [showCaption, setShowCaption] = useState(false);
    const [position, setPosition] = useState<Position>('left');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string>('');

    const isDisabled = !file || isUploading;

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            setFile(files[0]);
            setUploadError(null);

            // Generate preview
            const reader = new FileReader();
            reader.onload = function () {
                if (typeof reader.result === 'string') {
                    setPreviewSrc(reader.result);

                    // Set default alt text based on filename
                    if (!altText) {
                        const fileName = files[0].name;
                        // Remove file extension and convert dashes/underscores to spaces
                        const nameWithoutExtension = fileName
                            .split('.')
                            .slice(0, -1)
                            .join('.');
                        const formattedName = nameWithoutExtension.replace(
                            /[-_]/g,
                            ' ',
                        );
                        setAltText(formattedName);
                    }
                }
            };
            reader.readAsDataURL(files[0]);
        }
    };

    useEffect(() => {
        hasModifier.current = false;
        const handler = (e: KeyboardEvent) => {
            hasModifier.current = e.altKey;
        };
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
        };
    }, [activeEditor]);

    const handleOnClick = async () => {
        if (!file) {
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            let serverImageUrl: string;

            // Check if onImageUpload is provided
            if (!onImageUpload) {
                // Fall back to default upload handler if available
                try {
                    serverImageUrl = await defaultUploadImageToServer(file);
                } catch (uploadError) {
                    setUploadError(
                        'Failed to upload image using default handler. Please try again.',
                    );
                    console.error('Default upload error:', uploadError);
                    setIsUploading(false);
                    return;
                }
            } else {
                // Use the provided custom upload handler
                const result = await onImageUpload(file);
                serverImageUrl = result.url;
            }

            // Update the src with the server URL
            setSrc(serverImageUrl);

            // Dispatch command with server URL
            const payload = {
                altText,
                position,
                showCaption,
                src: serverImageUrl,
            };

            activeEditor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, payload);
            onClose();
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload image to server. Please try again.',
            );
            console.error('Upload error:', error);
            setIsUploading(false);
        }
    };

    return (
        <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
                <Label htmlFor='image'>Image Upload</Label>
                <Input
                    id='image'
                    type='file'
                    onChange={(e) => handleFileChange(e.target.files)}
                    accept='image/*'
                    data-test-id='image-modal-file-upload'
                />
            </div>

            {previewSrc && (
                <div className='grid place-items-center'>
                    <img
                        src={previewSrc}
                        alt='Preview'
                        className='max-h-48 max-w-full object-contain rounded-md border border-gray-200'
                    />
                </div>
            )}

            <div className='grid gap-2'>
                <Label htmlFor='alt-text'>Alt Text</Label>
                <Input
                    id='alt-text'
                    placeholder='Descriptive alternative text'
                    onChange={(e) => setAltText(e.target.value)}
                    value={altText}
                    data-test-id='image-modal-alt-text-input'
                />
            </div>
            <div className='grid gap-2'>
                <Label htmlFor='position'>Position</Label>
                <Select
                    defaultValue='left'
                    onValueChange={(value) => setPosition(value as Position)}
                >
                    <SelectTrigger id='position'>
                        <SelectValue placeholder='Select position' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='left'>Left</SelectItem>
                        <SelectItem value='right'>Right</SelectItem>
                        <SelectItem value='full'>Full Width</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className='flex items-center space-x-2'>
                <Checkbox
                    id='caption'
                    checked={showCaption}
                    onCheckedChange={(checked) =>
                        setShowCaption(checked as boolean)
                    }
                />
                <Label htmlFor='caption'>Show Caption</Label>
            </div>

            {uploadError && (
                <div className='text-red-500 text-sm p-2 bg-red-50 rounded'>
                    {uploadError}
                </div>
            )}

            <Button
                data-test-id='image-modal-file-upload-btn'
                disabled={isDisabled}
                onClick={handleOnClick}
            >
                {isUploading ? (
                    <span className='flex items-center gap-2'>
                        <svg
                            className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                        >
                            <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                            ></circle>
                            <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                        </svg>
                        Uploading...
                    </span>
                ) : (
                    'Upload & Insert'
                )}
            </Button>
        </div>
    );
}

export function InlineImagePlugin({
    onImageUpload,
}: {
    onImageUpload?: (file: File) => Promise<{ url: string }>;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([InlineImageNode])) {
            throw new Error('ImagesPlugin: ImageNode not registered on editor');
        }

        return mergeRegister(
            editor.registerCommand<InsertInlineImagePayload>(
                INSERT_INLINE_IMAGE_COMMAND,
                (payload) => {
                    const imageNode = $createInlineImageNode(payload);
                    $insertNodes([imageNode]);
                    if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                        $wrapNodeInElement(
                            imageNode,
                            $createParagraphNode,
                        ).selectEnd();
                    }

                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
            editor.registerCommand<DragEvent>(
                DRAGSTART_COMMAND,
                (event) => {
                    return $onDragStart(event);
                },
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand<DragEvent>(
                DRAGOVER_COMMAND,
                (event) => {
                    return $onDragover(event);
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<DragEvent>(
                DROP_COMMAND,
                (event) => {
                    return $onDrop(event, editor);
                },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [editor]);

    return null;
}

function $onDragStart(event: DragEvent): boolean {
    const node = $getImageNodeInSelection();
    if (!node) {
        return false;
    }
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) {
        return false;
    }
    const TRANSPARENT_IMAGE =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const img = document.createElement('img');
    img.src = TRANSPARENT_IMAGE;
    dataTransfer.setData('text/plain', '_');
    dataTransfer.setDragImage(img, 0, 0);
    dataTransfer.setData(
        'application/x-lexical-drag',
        JSON.stringify({
            data: {
                altText: node.__altText,
                caption: node.__caption,
                height: node.__height,
                key: node.getKey(),
                showCaption: node.__showCaption,
                src: node.__src,
                width: node.__width,
                position: node.__position,
            },
            type: 'image',
        }),
    );

    return true;
}

function $onDragover(event: DragEvent): boolean {
    const node = $getImageNodeInSelection();
    if (!node) {
        return false;
    }
    if (!canDropImage(event)) {
        event.preventDefault();
    }
    return true;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
    const node = $getImageNodeInSelection();
    if (!node) {
        return false;
    }
    const data = getDragImageData(event);
    if (!data) {
        return false;
    }
    event.preventDefault();
    if (canDropImage(event)) {
        const range = getDragSelection(event);
        node.remove();
        const rangeSelection = $createRangeSelection();
        if (range !== null && range !== undefined) {
            rangeSelection.applyDOMRange(range);
        }
        $setSelection(rangeSelection);
        editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, data);
    }
    return true;
}

function $getImageNodeInSelection(): InlineImageNode | null {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
        return null;
    }
    const nodes = selection.getNodes();
    const node = nodes[0];
    return $isInlineImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertInlineImagePayload {
    const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
    if (!dragData) {
        return null;
    }
    const { type, data } = JSON.parse(dragData);
    if (type !== 'image') {
        return null;
    }

    return data;
}

declare global {
    interface DragEvent {
        rangeOffset?: number;
        rangeParent?: Node;
    }
}

function canDropImage(event: DragEvent): boolean {
    const target = event.target;
    return !!(
        target &&
        target instanceof HTMLElement &&
        !target.closest('code, span.editor-image') &&
        target.parentElement &&
        target.parentElement.closest('div.ContentEditable__root')
    );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
    let range;
    const target = event.target as null | Element | Document;
    const targetWindow =
        target == null
            ? null
            : target.nodeType === 9
              ? (target as Document).defaultView
              : (target as Element).ownerDocument.defaultView;
    const domSelection = getDOMSelection(targetWindow);
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
    } else if (event.rangeParent && domSelection !== null) {
        domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
        range = domSelection.getRangeAt(0);
    } else {
        throw Error('Cannot get the selection when dragging');
    }

    return range;
}

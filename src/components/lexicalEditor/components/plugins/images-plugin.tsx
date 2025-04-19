'use client';

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useEffect, useRef, useState, JSX } from 'react';
import * as React from 'react';

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
import { DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

import {
    $createImageNode,
    $isImageNode,
    ImageNode,
    ImagePayload,
} from '../nodes/image-node';
import { CAN_USE_DOM } from '../shared/can-use-dom';

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
    CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
    createCommand('INSERT_IMAGE_COMMAND');

// Command for uploading and inserting an image
export const UPLOAD_IMAGE_COMMAND: LexicalCommand<File> = createCommand(
    'UPLOAD_IMAGE_COMMAND',
);

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

export function InsertImageUriDialogBody({
    onClick,
}: {
    onClick: (payload: InsertImagePayload) => void;
}) {
    const [src, setSrc] = useState('');
    const [altText, setAltText] = useState('');

    const isDisabled = src === '';

    return (
        <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
                <Label htmlFor='image-url'>Image URL</Label>
                <Input
                    id='image-url'
                    placeholder='i.e. https://source.unsplash.com/random'
                    onChange={(e) => setSrc(e.target.value)}
                    value={src}
                    data-test-id='image-modal-url-input'
                />
            </div>
            <div className='grid gap-2'>
                <Label htmlFor='alt-text'>Alt Text</Label>
                <Input
                    id='alt-text'
                    placeholder='Random unsplash image'
                    onChange={(e) => setAltText(e.target.value)}
                    value={altText}
                    data-test-id='image-modal-alt-text-input'
                />
            </div>
            <DialogFooter>
                <Button
                    type='submit'
                    disabled={isDisabled}
                    onClick={() => onClick({ altText, src })}
                    data-test-id='image-modal-confirm-btn'
                >
                    Confirm
                </Button>
            </DialogFooter>
        </div>
    );
}

export function InsertImageUploadedDialogBody({
    onClick,
    onClose,
    onImageUpload,
}: {
    onClick: (payload: InsertImagePayload) => void;
    onClose?: () => void;
    onImageUpload?: (file: File) => Promise<{ url: string }>;
}) {
    const [editor] = useLexicalComposerContext();
    const [src, setSrc] = useState<string>('');
    const [altText, setAltText] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
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
                }
            };
            reader.readAsDataURL(files[0]);

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

    const handleUpload = async () => {
        if (!file) {
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            // Check if onImageUpload is provided

            if (!onImageUpload) {
                // Fall back to default upload handler if available
                try {
                    const url = await defaultUploadImageToServer(file);
                    setSrc(url);
                    onClick({ altText, src: url });
                    if (onClose) {
                        onClose();
                    }
                } catch (uploadError) {
                    setUploadError(
                        'Failed to upload image using default handler. Please try again or use URL option.',
                    );
                    console.error('Default upload error:', uploadError);
                }
            } else {
                // Use the provided custom upload handler
                const result = await onImageUpload(file);
                const serverImageUrl = result.url;

                // Update the src with the server URL
                setSrc(serverImageUrl);

                // Call the onClick handler with the server URL
                onClick({ altText, src: serverImageUrl });

                // Close the dialog if needed
                if (onClose) {
                    onClose();
                }
            }
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload image to server. Please try again.',
            );
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
                <Label htmlFor='image-upload'>Image Upload</Label>
                <Input
                    id='image-upload'
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

            {uploadError && (
                <div className='text-red-500 text-sm p-2 bg-red-50 rounded'>
                    {uploadError}
                </div>
            )}

            <DialogFooter>
                <Button
                    type='submit'
                    disabled={isDisabled}
                    onClick={handleUpload}
                    data-test-id='image-modal-file-upload-btn'
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
            </DialogFooter>
        </div>
    );
}
export function InsertImageDialog({
    activeEditor,
    onClose,
    onImageUpload,
}: {
    activeEditor: LexicalEditor;
    onClose: () => void;
    onImageUpload?: (file: File) => Promise<any | { url: string }>;
}): JSX.Element {
    const hasModifier = useRef(false);

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

    const onClick = (payload: InsertImagePayload) => {
        activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
        onClose();
    };

    return (
        <Tabs defaultValue='url'>
            <TabsList className='w-full'>
                <TabsTrigger
                    value='url'
                    className='w-full text-dark dark:text-white'
                >
                    URL
                </TabsTrigger>
                <TabsTrigger
                    value='file'
                    className='w-full text-dark dark:text-white'
                >
                    File
                </TabsTrigger>
            </TabsList>
            <TabsContent value='url'>
                <InsertImageUriDialogBody onClick={onClick} />
            </TabsContent>
            <TabsContent value='file'>
                <InsertImageUploadedDialogBody
                    onClick={onClick}
                    onClose={onClose}
                    onImageUpload={onImageUpload}
                />
            </TabsContent>
        </Tabs>
    );
}

export function ImagesPlugin({
    captionsEnabled,
}: {
    captionsEnabled?: boolean;
    onImageUpload?: (file: File) => Promise<{ url: string }>;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagesPlugin: ImageNode not registered on editor');
        }

        return mergeRegister(
            editor.registerCommand<InsertImagePayload>(
                INSERT_IMAGE_COMMAND,
                (payload) => {
                    const imageNode = $createImageNode(payload);
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
    }, [captionsEnabled, editor]);

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
                maxWidth: node.__maxWidth,
                showCaption: node.__showCaption,
                src: node.__src,
                width: node.__width,
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
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
    }
    return true;
}

function $getImageNodeInSelection(): ImageNode | null {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
        return null;
    }
    const nodes = selection.getNodes();
    const node = nodes[0];
    return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
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
        throw Error(`Cannot get the selection when dragging`);
    }

    return range;
}

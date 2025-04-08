import {
  Dispatch,
  useCallback,
  useEffect,
  useRef,
  useState,
  JSX,
} from 'react'
import * as React from 'react'

import { $isCodeHighlightNode } from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalCommand,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  createCommand,
} from 'lexical'
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  CodeIcon,
  LinkIcon,
  SubscriptIcon,
  SuperscriptIcon,
  ChevronDown,
  Sparkles,
  MessageSquare,
  AlignJustify,
  Scissors,
  Maximize,
  Minimize,
  FileDigit,
  PenTool,
  Languages,
  Edit,
  Loader2,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { Separator } from '../../ui/separator'
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../../ui/dropdown-menu'

import { useFloatingLinkContext } from '../context/floating-link-context'
import { getDOMRangeRect } from '../utils/get-dom-range-rect'
import { getSelectedNode } from '../utils/get-selected-node'
import { setFloatingElemPosition } from '../utils/set-floating-elem-position'
import { Button } from '../../ui/button'

// Loading indicator component
function AILoadingIndicator({ visible }: { visible: boolean }): JSX.Element | null {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
      <div className="bg-white rounded-md p-4 shadow-lg flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Generating text with AI...</span>
      </div>
    </div>
  );
}

// New command type for AI text transformations
type AITextTransformPayload = {
  transformType: string;
  editorRef: React.MutableRefObject<LexicalEditor | null>;
};

// New command for AI text transformations
const AI_TEXT_TRANSFORM_COMMAND: LexicalCommand<AITextTransformPayload> =
  createCommand('AI_TEXT_TRANSFORM_COMMAND');

// Helper function to process AI transformation asynchronously
async function processAITransformation(
  payload: AITextTransformPayload,
  selectedText: string,
  setIsAILoading: (loading: boolean) => void,
  onAIGeneration?: (prompt: string, transformType: string) => Promise<{ text: string, success: boolean, error?: string }>
) {
  const { transformType, editorRef } = payload;

  // Create appropriate prompt based on transformation type
  let prompt = '';

  if (transformType.startsWith('translate-')) {
    const language = transformType.split('-')[1];
    prompt = `Translate the following text to ${language}: "${selectedText}"`;
  } else if (transformType.startsWith('custom:')) {
    prompt = transformType.substring(7);
  } else if (transformType.startsWith('tone-')) {
    const tone = transformType.split('-')[1];
    prompt = `Rewrite the following text in a ${tone} tone: "${selectedText}"`;
  } else if (transformType.startsWith('style-')) {
    const style = transformType.split('-')[1];
    prompt = `Rewrite the following text in ${style} style: "${selectedText}"`;
  } else {
    // Handle other transformations
    switch (transformType) {
      case 'improve':
        prompt = `Improve the writing of the following text while maintaining its meaning: "${selectedText}"`;
        break;
      case 'shorter':
        prompt = `Make the following text shorter and more concise while preserving its key points: "${selectedText}"`;
        break;
      case 'longer':
        prompt = `Expand and elaborate on the following text: "${selectedText}"`;
        break;
      case 'summarize':
        prompt = `Summarize the following text: "${selectedText}"`;
        break;
      case 'continue':
        prompt = `Continue writing from the following text with that text included: ${selectedText}`;
        break;
      default:
        prompt = `Transform the following text: "${selectedText}"`;
    }
  }

  try {
    let generatedText = '';

    // Use the provided AI generation handler if available
    if (onAIGeneration) {
      const result = await onAIGeneration(prompt, transformType);

      if (result.success) {
        generatedText = result.text;
      } else {
        console.error('AI generation failed:', result.error);
        return;
      }
    } 

    if(!generatedText) {
      console.error('No generated text received from AI generation.');
      return;
    }

    // Update the editor inside an update transaction
    if (editorRef.current && generatedText) {
      editorRef.current.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // Replace the selected text with the AI-generated text
        selection.insertText(generatedText);
      });
    }
  } catch (error) {
    console.error('Error processing AI text generation:', error);
  } finally {
    setIsAILoading(false);
  }
}

function FloatingTextFormat({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  setIsLinkEditMode,
  editorRef,
  setIsAILoading,
  onAIGeneration,
}: {
  editor: LexicalEditor
  anchorElem: HTMLElement
  isBold: boolean
  isCode: boolean
  isItalic: boolean
  isLink: boolean
  isStrikethrough: boolean
  isSubscript: boolean
  isSuperscript: boolean
  isUnderline: boolean
  setIsLinkEditMode: Dispatch<boolean>
  editorRef: React.MutableRefObject<LexicalEditor | null>
  setIsAILoading: Dispatch<boolean>
  onAIGeneration?: (prompt: string, transformType: string) => Promise<{ text: string, success: boolean, error?: string }>
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null)

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true)
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    } else {
      setIsLinkEditMode(false)
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink, setIsLinkEditMode])

  // AI text transformation function
  const transformText = useCallback((transformType: string) => {
    setIsAILoading(true) // Show loading indicator
    editor.dispatchCommand(AI_TEXT_TRANSFORM_COMMAND, {
      transformType,
      editorRef,
    })
  }, [editor, setIsAILoading, editorRef])

  function mouseMoveListener(e: MouseEvent) {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'none') {
        const x = e.clientX
        const y = e.clientY
        const elementUnderMouse = document.elementFromPoint(x, y)

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = 'none'
        }
      }
    }
  }
  function mouseUpListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
        popupCharStylesEditorRef.current.style.pointerEvents = 'auto'
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener('mousemove', mouseMoveListener)
      document.addEventListener('mouseup', mouseUpListener)

      return () => {
        document.removeEventListener('mousemove', mouseMoveListener)
        document.removeEventListener('mouseup', mouseUpListener)
      }
    }
  }, [popupCharStylesEditorRef])

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection()

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current
    const nativeSelection = window.getSelection()

    if (popupCharStylesEditorElem === null) {
      return
    }

    const rootElement = editor.getRootElement()
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement)

      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isLink
      )
    }
  }, [editor, anchorElem, isLink])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar()
      })
    }

    window.addEventListener('resize', update)
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update)
    }

    return () => {
      window.removeEventListener('resize', update)
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update)
      }
    }
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem])

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar()
    })
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, $updateTextFormatFloatingToolbar])

  return (
    <div
      ref={popupCharStylesEditorRef}
      className="absolute left-0 top-0 z-10 flex gap-1 rounded-md border p-1 opacity-0 shadow-md transition-opacity duration-300 will-change-transform bg-background"
    >
      {editor.isEditable() && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Generate from selection</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => transformText('improve')}>
                  <PenTool className="mr-2 h-4 w-4" />
                  <span>Improve writing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => transformText('shorter')}>
                  <Scissors className="mr-2 h-4 w-4" />
                  <span>Make shorter</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => transformText('longer')}>
                  <Maximize className="mr-2 h-4 w-4" />
                  <span>Make longer</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => transformText('summarize')}>
                  <Minimize className="mr-2 h-4 w-4" />
                  <span>Summarize</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => transformText('continue')}>
                  <AlignJustify className="mr-2 h-4 w-4" />
                  <span>Continue writing</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Change tone</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => transformText('tone-professional')}>
                    Professional
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('tone-casual')}>
                    Casual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('tone-friendly')}>
                    Friendly
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('tone-confident')}>
                    Confident
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileDigit className="mr-2 h-4 w-4" />
                  <span>Change style</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => transformText('style-academic')}>
                    Academic
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('style-technical')}>
                    Technical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('style-creative')}>
                    Creative
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('style-persuasive')}>
                    Persuasive
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages className="mr-2 h-4 w-4" />
                  <span>Translate</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => transformText('translate-english')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-spanish')}>
                    Spanish
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-french')}>
                    French
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-german')}>
                    German
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-chinese')}>
                    Chinese
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-japanese')}>
                    Japanese
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-arabic')}>
                    Arabic
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-hindi')}>
                    Hindi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-portuguese')}>
                    Portuguese
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => transformText('translate-bangla')}>
                    Bangla (Bengali)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem onClick={() => {
                // Get selected text within an editor transaction
                editor.update(() => {
                  const selection = $getSelection();
                  if (!$isRangeSelection(selection)) return;

                  const selectedText = selection.getTextContent();
                  // Display custom prompt modal
                  const customPrompt = window.prompt('Custom AI instruction:', `Transform the following text: "${selectedText}"`);

                  if (customPrompt) {
                    transformText(`custom:${customPrompt}`);
                  }
                });
              }}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Custom instruction</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ToggleGroup
            type="multiple"
            defaultValue={[
              isBold ? 'bold' : '',
              isItalic ? 'italic' : '',
              isUnderline ? 'underline' : '',
              isStrikethrough ? 'strikethrough' : '',
              isSubscript ? 'subscript' : '',
              isSuperscript ? 'superscript' : '',
              isCode ? 'code' : '',
              isLink ? 'link' : '',
            ]}
          >
            <ToggleGroupItem
              value="bold"
              aria-label="Toggle bold"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
              }}
              size="sm"
            >
              <BoldIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              aria-label="Toggle italic"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
              }}
              size="sm"
            >
              <ItalicIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="underline"
              aria-label="Toggle underline"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
              }}
              size="sm"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="strikethrough"
              aria-label="Toggle strikethrough"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
              }}
              size="sm"
            >
              <StrikethroughIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <Separator orientation="vertical" />
            <ToggleGroupItem
              value="code"
              aria-label="Toggle code"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
              }}
              size="sm"
            >
              <CodeIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="link"
              aria-label="Toggle link"
              onClick={insertLink}
              size="sm"
            >
              <LinkIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <Separator orientation="vertical" />
          </ToggleGroup>
          <ToggleGroup
            type="single"
            defaultValue={
              isSubscript ? 'subscript' : isSuperscript ? 'superscript' : ''
            }
          >
            <ToggleGroupItem
              value="subscript"
              aria-label="Toggle subscript"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
              }}
              size="sm"
            >
              <SubscriptIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="superscript"
              aria-label="Toggle superscript"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
              }}
              size="sm"
            >
              <SuperscriptIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </>
      )}
    </div>
  )
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  setIsLinkEditMode: Dispatch<boolean>,
  editorRef: React.MutableRefObject<LexicalEditor | null>,
  setIsAILoading: Dispatch<boolean>,
  onAIGeneration?: (prompt: string, transformType: string) => Promise<{ text: string, success: boolean, error?: string }>
): JSX.Element | null {
  const [isText, setIsText] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isSubscript, setIsSubscript] = useState(false)
  const [isSuperscript, setIsSuperscript] = useState(false)
  const [isCode, setIsCode] = useState(false)

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return
      }
      const selection = $getSelection()
      const nativeSelection = window.getSelection()
      const rootElement = editor.getRootElement()

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false)
        return
      }

      if (!$isRangeSelection(selection)) {
        return
      }

      const node = getSelectedNode(selection)

      // Update text format
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsSubscript(selection.hasFormat('subscript'))
      setIsSuperscript(selection.hasFormat('superscript'))
      setIsCode(selection.hasFormat('code'))

      // Update links
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ''
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node))
      } else {
        setIsText(false)
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '')
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false)
        return
      }
    })
  }, [editor])

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup)
    return () => {
      document.removeEventListener('selectionchange', updatePopup)
    }
  }, [updatePopup])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup()
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false)
        }
      }),
      // Register AI transformation command handler
      editor.registerCommand(
        AI_TEXT_TRANSFORM_COMMAND,
        (payload) => {
          const { transformType } = payload;

          // First, capture the selected text in a safe transaction
          let selectedText = '';
          let wasSelected = false;

          // Capture the selection within a read transaction
          editor.getEditorState().read(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              selectedText = selection.getTextContent();
              wasSelected = !selection.isCollapsed();
            }
          });

          // If no text was selected, we can't transform anything
          if (!wasSelected || !selectedText.trim()) {
            setIsAILoading(false);
            return false;
          }

          // Process the transformation asynchronously
          processAITransformation(payload, selectedText, setIsAILoading, onAIGeneration);

          // Return true to indicate the command was handled
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updatePopup, setIsAILoading, onAIGeneration])

  if (!isText || !anchorElem) {
    return null
  }

  return createPortal(
    <FloatingTextFormat
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
      editorRef={editorRef}
      setIsAILoading={setIsAILoading}
      onAIGeneration={onAIGeneration}
    />,
    anchorElem
  )
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem,
  onAIGeneration,
}: {
  anchorElem: HTMLDivElement | null,
  onAIGeneration?: (prompt: string, transformType: string) => Promise<{ text: string, success: boolean, error?: string }>
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { setIsLinkEditMode } = useFloatingLinkContext()
  const editorRef = useRef<LexicalEditor | null>(editor);
  const [isAILoading, setIsAILoading] = useState(false);

  // Keep the ref updated
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <>
      {useFloatingTextFormatToolbar(
        editor,
        anchorElem,
        setIsLinkEditMode,
        editorRef,
        setIsAILoading,
        onAIGeneration
      )}
      <AILoadingIndicator visible={isAILoading} />
    </>
  );
}
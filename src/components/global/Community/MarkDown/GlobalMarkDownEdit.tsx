import MDEditor from '@uiw/react-md-editor';
import React, { Dispatch, SetStateAction } from 'react';
import { cn } from '@/lib/utils';

/**
 * 📝 **GlobalMarkDownEdit Component**
 * A Markdown editor component powered by `@uiw/react-md-editor`, allowing users to write and edit Markdown content with a real-time preview.
 *
 * ✅ **Required Props:**
 * - `setValue` (Dispatch<SetStateAction<string>>): A state updater function to manage the Markdown content.
 *
 * 🎨 **Optional Props:**
 * - `value` (string): The current Markdown content. Defaults to an empty string.
 * - `className` (string): Additional Tailwind CSS classes to customize the editor.
 * - `ngClass` (string): Additional Tailwind CSS classes for the outer container.
 * - `label` (string): A label displayed above the editor.
 * - `required` (boolean): Whether the field is required, displaying an asterisk if `true`. Defaults to `false`.
 *
 * 💡 **Usage:**
 * This component is useful for applications requiring Markdown-based content creation, such as blogs, documentation, or user-generated content.
 *
 * ```tsx
 * import GlobalMarkDownEdit from "@/components/GlobalMarkDownEdit";
 * import { useState } from "react";
 *
 * const ExampleComponent = () => {
 *   const [content, setContent] = useState("");
 *
 *   return (
 *     <div className="p-4">
 *       <GlobalMarkDownEdit
 *         label="Write your content"
 *         value={content}
 *         setValue={setContent}
 *         required
 *       />
 *     </div>
 *   );
 * };
 * ```
 *
 * ⚙️ **Important:**
 * - **Markdown Parsing**: Uses `@uiw/react-md-editor` to render a Markdown editor with real-time updates.
 * - **Controlled Component**: `value` is managed externally via `setValue`, ensuring full control.
 * - **Styling**: Customizable via `className` and `ngClass`.
 * - **Accessibility**: Supports labeling via the `label` prop.
 *
 * 🎯 **Features:**
 * - **Live Markdown Editing**: Provides a seamless editing experience.
 * - **Customizable UI**: Allows passing styles via props.
 * - **Responsive & User-Friendly**: Works well on various screen sizes.
 */

const GlobalMarkDownEdit = ({
    value,
    setValue,
    className,
    ngClass,
    label,
    required = false,
}: {
    value?: string;
    setValue: Dispatch<SetStateAction<string>>;
    className?: string;
    ngClass?: string;
    label?: string;
    required?: boolean;
}) => {
    return (
        <div className={cn('g-mdEditor', ngClass)}>
            <label htmlFor={label} className='text-sm font-semibold text-gray'>
                {label}
                {required && (
                    <span className='ml-1 text-xs text-destructive'>*</span>
                )}
            </label>
            <MDEditor
                value={value}
                onChange={(val) => setValue(val || '')}
                className={cn('h-[500px] whitespace-pre-wrap', className)}
                preview='edit'
                visibleDragbar={false}
            />
        </div>
    );
};

export default GlobalMarkDownEdit;

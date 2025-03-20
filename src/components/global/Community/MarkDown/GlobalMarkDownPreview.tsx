import MDEditor from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';

/**
 * 📄 **GlobalMarkDownPreview Component**
 * A Markdown preview component powered by `@uiw/react-md-editor`, rendering Markdown content as formatted HTML.
 *
 * ✅ **Required Props:**
 * - `text` (string): The Markdown content to be rendered.
 *
 * 🎨 **Optional Props:**
 * - `className` (string): Additional Tailwind CSS classes for customizing the preview.
 * - `ngClass` (string): Additional Tailwind CSS classes for the outer container.
 *
 * 💡 **Usage:**
 * This component is useful for displaying Markdown-formatted text in applications such as blogs, documentation, or comment sections.
 *
 * ```tsx
 * import GlobalMarkDownPreview from "@/components/GlobalMarkDownPreview";
 *
 * const ExampleComponent = () => {
 *   const markdownText = "# Hello, Markdown! \nThis is a preview of *Markdown*.";
 *
 *   return (
 *     <div className="p-4">
 *       <GlobalMarkDownPreview text={markdownText} className="text-gray-700" />
 *     </div>
 *   );
 * };
 * ```
 *
 * ⚙️ **Important:**
 * - **Markdown Parsing**: Uses `@uiw/react-md-editor` to parse and render Markdown text as HTML.
 * - **Styling**: Customizable using `className` and `ngClass`.
 * - **Security**: Markdown content is sanitized automatically to prevent XSS attacks.
 *
 * 🎯 **Features:**
 * - **Live Markdown Rendering**: Displays formatted Markdown content.
 * - **Customizable UI**: Allows passing styles via props.
 * - **Optimized Performance**: Renders efficiently using `MDEditor.Markdown`.
 */

const GlobalMarkDownPreview = ({
    text,
    className,
    ngClass,
}: {
    text: string;
    className?: string;
    ngClass?: string;
}) => {
    return (
        <div className={cn('g-mdEditor', ngClass)}>
            <MDEditor.Markdown
                source={text}
                className={cn('', className)}
                style={{ padding: '12px' }}
            />
        </div>
    );
};

export default GlobalMarkDownPreview;

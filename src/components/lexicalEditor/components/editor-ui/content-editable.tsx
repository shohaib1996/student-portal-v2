import { JSX } from 'react';
import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable';

type Props = {
    placeholder: string;
    className?: string;
    placeholderClassName?: string;
    onSubmit?: () => void;
};

export function ContentEditable({
    placeholder,
    className,
    placeholderClassName,
    onSubmit,
}: Props): JSX.Element {
    return (
        <LexicalContentEditable
            className={
                className ??
                `ContentEditable__root relative block overflow-auto min-h-full px-2 py-4 focus:outline-none whitespace-pre-wrap`
            }
            aria-placeholder={placeholder}
            placeholder={
                <div
                    className={
                        placeholderClassName ??
                        `pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-4 py-2 text-muted-foreground`
                    }
                >
                    {placeholder}
                </div>
            }
        />
    );
}

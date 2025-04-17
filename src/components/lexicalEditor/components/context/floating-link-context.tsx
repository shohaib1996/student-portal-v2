import { createContext, useContext, useState } from 'react';
import { $generateHtmlFromNodes } from '@lexical/html';
import { LexicalEditor } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
const Context = createContext<{
    isLinkEditMode: boolean;
    setIsLinkEditMode: (isLinkEditMode: boolean) => void;
}>({
    isLinkEditMode: false,
    setIsLinkEditMode: () => {},
});

export function FloatingLinkContext({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
    const [editor] = useLexicalComposerContext();

    return (
        <Context.Provider value={{ isLinkEditMode, setIsLinkEditMode }}>
            {children}
        </Context.Provider>
    );
}

export function useFloatingLinkContext() {
    if (!Context) {
        throw new Error(
            'useFloatingLinkContext must be used within a FloatingLinkContext',
        );
    }
    return useContext(Context);
}

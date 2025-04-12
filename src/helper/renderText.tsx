import MessagePreview from '@/components/chat/Message/MessagePreview';
import LexicalJsonRenderer from '@/components/lexicalEditor/renderer/JsonRenderer';

export const renderText = (text: string) => {
    try {
        const obj = JSON.parse(text);
        if (typeof obj === 'object' && obj !== null) {
            return <LexicalJsonRenderer lexicalState={obj} />;
        } else {
            return <MessagePreview text={text} />;
        }
    } catch (error) {
        // If parsing fails, treat it as a regular string
        return <MessagePreview text={text} />;
    }
};

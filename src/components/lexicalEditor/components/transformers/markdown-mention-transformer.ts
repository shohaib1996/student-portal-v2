import type { TextMatchTransformer } from '@lexical/markdown';
import { TextNode } from 'lexical';
import {
    $createBeautifulMentionNode,
    $isBeautifulMentionNode,
} from '../plugins/beautiful-mention/MentionNode';

export const MENTION_MARKDOWN_TRANSFORMER: TextMatchTransformer = {
    // Matches markdown of the form: @[Label](ID)
    importRegExp: /@\[([^\]]+)\]\(([^)]+)\)/,
    regExp: /@\[([^\]]+)\]\(([^)]+)\)/,
    dependencies: [],

    /**
     * Export: Given a mention node, return `@[Label](ID)`.
     */
    export: (node) => {
        if ($isBeautifulMentionNode(node)) {
            const label = node.getValue(); // e.g. "shimul"
            const data = node.getData() || {};
            const id = data.id || '';
            return `@[${label}](${id})`;
        }
        return null;
    },

    // import: (textNode, match) => {
    //   console.log('Markdown mention transformer import', textNode, match);
    //   const [_, label, id] = match;
    //   const mentionNode = $createBeautifulMentionNode(label, { id });
    //   textNode.replace(mentionNode);
    // },

    /**
     * Replace: Transform the matched text into a MentionNode
     */
    replace: (textNode, match) => {
        console.log('Markdown mention transformer replace', textNode, match);

        const [, label, id] = match;

        console.log({
            label,
            id,
        });

        const mentionNode = $createBeautifulMentionNode('@', label, {
            id,
            label,
        });
        textNode.replace(mentionNode);
    },

    // Change the type to "text-match" so Lexical treats this transformer as an inline text match.
    type: 'text-match',
};

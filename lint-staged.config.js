/* eslint-env node */

const prettierCheck = 'prettier --write';
const eslintFix = 'eslint --fix';

export default {
    '*.{js,jsx,ts,tsx}': [eslintFix, prettierCheck],
    // '*.{css,scss}': [stylelintCheck, prettierCheck],
};

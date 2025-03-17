export function copyTextToClipboard(text: string): Promise<void> {
    if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        window.isSecureContext
    ) {
        // Use the Clipboard API where available
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers or non-secure contexts
        return new Promise<void>((resolve, reject) => {
            try {
                const textArea: HTMLTextAreaElement =
                    document.createElement('textarea');
                textArea.value = text;

                // Styling to prevent the textarea from showing
                textArea.style.position = 'absolute';
                textArea.style.left = '-9999px';
                textArea.setAttribute('readonly', '');

                document.body.appendChild(textArea);
                textArea.select();
                textArea.setSelectionRange(0, 99999); // Ensure compatibility with mobile devices

                const successful: boolean = document.execCommand('copy');
                if (!successful) {
                    console.error('Fallback: Copy command was unsuccessful');
                    reject(new Error('Copy command was unsuccessful'));
                } else {
                    resolve();
                }

                document.body.removeChild(textArea);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                reject(err);
            }
        });
    }
}

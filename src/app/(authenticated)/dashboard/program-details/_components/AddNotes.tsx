import { Button } from '@/components/ui/button';
import { useState } from 'react';

const AddNotes = () => {
    const [currentTime, setCurrentTime] = useState(0);
    const [notes, setNotes] = useState<string>(
        'The six key components of automation technology include...\n\nIntegration between systems is critical for successful implementation.\n\nIntegration between systems is critical for successful implementation.',
    );
    const [editedNotes, setEditedNotes] = useState<string>('');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [showSavedMessage, setShowSavedMessage] = useState(false);
    // Add a new state to track edit mode
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    // Modify the handleSaveNotes function
    const handleSaveNotes = () => {
        setNotes(editedNotes);
        setShowSavedMessage(true);
        setIsEditingNotes(false); // Exit edit mode after saving
        setTimeout(() => {
            setShowSavedMessage(false);
        }, 3000);
    };

    // Modify the handleCancelNotes function
    const handleCancelNotes = () => {
        setEditedNotes(notes);
        setIsEditingNotes(false); // Exit edit mode on cancel
    };

    const applyFormatting = (format: string) => {
        const textarea = document.getElementById(
            'notes-textarea',
        ) as HTMLTextAreaElement;
        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = editedNotes.substring(start, end);
        let formattedText = selectedText;

        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                setIsBold(!isBold);
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                setIsItalic(!isItalic);
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                setIsUnderline(!isUnderline);
                break;
            case 'strikethrough':
                formattedText = `~~${selectedText}~~`;
                setIsStrikethrough(!isStrikethrough);
                break;
            case 'bullet':
                formattedText = selectedText
                    .split('\n')
                    .map((line) => `• ${line}`)
                    .join('\n');
                break;
            case 'number':
                formattedText = selectedText
                    .split('\n')
                    .map((line, i) => `${i + 1}. ${line}`)
                    .join('\n');
                break;
            case 'timestamp':
                formattedText = `[${formatTime(currentTime)}] ${selectedText}`;
                break;
        }

        const newText =
            editedNotes.substring(0, start) +
            formattedText +
            editedNotes.substring(end);
        setEditedNotes(newText);

        // Focus back on textarea and set cursor position after the inserted text
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + formattedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className='py-2'>
            <div className='flex justify-between items-center mb-2'>
                <h3 className='text-lg font-medium text-black'>Your notes</h3>
                {isEditingNotes ? (
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            className='text-dark-gray hover:bg-background flex items-center gap-1'
                            onClick={handleCancelNotes}
                        >
                            <svg
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M6 18L18 6M6 6L18 18'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                            Cancel
                        </Button>
                        <Button variant='default' onClick={handleSaveNotes}>
                            <svg
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                                className='mr-1'
                            >
                                <path
                                    d='M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V21C19 21.5304 18.7893 22.0391 18.4142 22.4142C18.0391 22.7893 17.5304 23 17 23H7C6.46957 23 5.96086 22.7893 5.58579 22.4142C5.21071 22.0391 5 21.5304 5 21Z'
                                    stroke='white'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M9 17L15 17'
                                    stroke='white'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M9 13L15 13'
                                    stroke='white'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M14 3V8H19'
                                    stroke='white'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                            Save
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant='default'
                        onClick={() => setIsEditingNotes(true)}
                    >
                        <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                            className='mr-1'
                        >
                            <path
                                d='M11 4H4V20H20V13'
                                stroke='white'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z'
                                stroke='white'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                        Edit
                    </Button>
                )}
            </div>

            {showSavedMessage && (
                <div className='mb-4 p-2 bg-background text-green-700 rounded-md flex items-center gap-2'>
                    <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M5 13L9 17L19 7'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                    Notes saved successfully!
                </div>
            )}

            {isEditingNotes ? (
                <div className='border border-border rounded-md'>
                    <div className='flex items-center gap-2 p-2 border-b border-border'>
                        <button
                            className={`p-1 hover:bg-gray-100 rounded ${isBold ? 'bg-gray-100' : ''}`}
                            onClick={() => applyFormatting('bold')}
                        >
                            <span className='font-bold'>B</span>
                        </button>
                        <button
                            className={`p-1 hover:bg-gray-100 rounded ${isItalic ? 'bg-gray-100' : ''}`}
                            onClick={() => applyFormatting('italic')}
                        >
                            <span className='italic'>I</span>
                        </button>
                        <button
                            className={`p-1 hover:bg-gray-100 rounded ${isUnderline ? 'bg-gray-100' : ''}`}
                            onClick={() => applyFormatting('underline')}
                        >
                            <span className='underline'>U</span>
                        </button>
                        <button
                            className={`p-1 hover:bg-gray-100 rounded ${isStrikethrough ? 'bg-gray-100' : ''}`}
                            onClick={() => applyFormatting('strikethrough')}
                        >
                            <span className='line-through'>S</span>
                        </button>
                        <div className='h-4 w-px bg-gray-300 mx-1'></div>
                        <button
                            className='p-1 hover:bg-gray-100 rounded'
                            onClick={() => applyFormatting('bullet')}
                        >
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M8 4H21'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M8 12H21'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M8 20H21'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M3 4H3.01'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M3 12H3.01'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M3 20H3.01'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                        <button
                            className='p-1 hover:bg-gray-100 rounded'
                            onClick={() => applyFormatting('number')}
                        >
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M11 4H4'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M11 12H4'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M11 20H4'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M16 4H20'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M16 12H20'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M16 20H20'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M16 8V16'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                        <button
                            className='p-1 hover:bg-gray-100 rounded'
                            onClick={() => applyFormatting('timestamp')}
                        >
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M12 8V12L15 15'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                        <div className='h-4 w-px bg-gray-300 mx-1'></div>
                        <button className='p-1 hover:bg-gray-100 rounded'>
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M10 13C10 13 11.5 15 15 15C18.5 15 20 13 20 13'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M15 9C16.1046 9 17 8.10457 17 7C17 5.89543 16.1046 5 15 5C13.8954 5 13 5.89543 13 7C13 8.10457 13.8954 9 15 9Z'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M4 21V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H18C18.5304 3 19.0391 3.21071 19.4142 3.58579C19.7893 3.96086 20 4.46957 20 5V21L16 17L12 21L8 17L4 21Z'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                        <button className='p-1 hover:bg-gray-100 rounded'>
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M18 20C18 16.6863 15.3137 14 12 14C8.68629 14 6 16.6863 6 20'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                        <button className='p-1 hover:bg-gray-100 rounded'>
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M15 10L19 6M19 6L15 2M19 6H10C7.79086 6 6 7.79086 6 10V21'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M9 14L5 18M5 18L9 22M5 18H14C16.2091 18 18 16.2091 18 14V3'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </button>
                    </div>

                    <div className='p-1'>
                        <div className='text-gray mb-2'>
                            (you can add timestamp, format text, and organize
                            your thoughts as the video play)
                        </div>
                        <textarea
                            id='notes-textarea'
                            className='w-full min-h-[200px] p-2 border-0 focus:outline-none focus:ring-0 resize-y'
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder='Write your notes here...'
                        ></textarea>
                    </div>
                </div>
            ) : (
                <div className='border border-border rounded-md p-4 bg-background'>
                    <div className='prose prose-sm max-w-none'>
                        {notes.split('\n').map((paragraph, index) => (
                            <p
                                key={index}
                                className={index === 0 ? 'mt-0' : 'mt-4'}
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddNotes;

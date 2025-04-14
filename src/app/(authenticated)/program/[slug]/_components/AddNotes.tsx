import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useState } from 'react';

const AddNotes = () => {
    const [notes, setNotes] = useState<string>(
        'The six key components of automation technology include...\n\nIntegration between systems is critical for successful implementation.\n\nIntegration between systems is critical for successful implementation.',
    );
    const [editedNotes, setEditedNotes] = useState<string>('');

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
                            <FileText className='stroke-pure-white' />
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
                <div className='border border-border rounded-md p-2'>
                    <div className='p-1 space-y-4'>
                        <div className=''>
                            {' '}
                            <Label className='mb-2 flex items-center gap-1'>
                                Title <span className='text-red-500'>*</span>
                            </Label>
                            <Input placeholder='Enter document name' />
                        </div>

                        <GlobalBlockEditor
                            className='w-full min-h-[200px] p-2 border-0 focus:outline-none focus:ring-0 resize-y'
                            value={editedNotes}
                            onChange={setEditedNotes}
                            placeholder='Write your notes here...'
                        ></GlobalBlockEditor>
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

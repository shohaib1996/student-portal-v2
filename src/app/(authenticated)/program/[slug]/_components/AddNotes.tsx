// 'use client';

// import GlobalBlockEditor from '@/components/editor/GlobalBlockEditor';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//     useAddNoteMutation,
//     useGetSingleNoteQuery,
//     useUpdateNoteMutation,
// } from '@/redux/api/notes/notesApi';
// import type { TNote } from '@/types';
// import { FileText, XIcon } from 'lucide-react';
// import { useState, useEffect, type FormEvent } from 'react';
// import { toast } from 'sonner';

// const AddNotes = ({ contentId }: { contentId: string }) => {
//     const [notes, setNotes] = useState<string>('');
//     const [title, setTitle] = useState<string>('');
//     const [parsedContent, setParsedContent] = useState<any>(null);
//     const [existingNoteId, setExistingNoteId] = useState<string | null>(null);
//     const [isEditingNotes, setIsEditingNotes] = useState(false);
//     const [showSavedMessage, setShowSavedMessage] = useState(false);

//     const { data: noteData, isLoading: isLoadingNote } =
//         useGetSingleNoteQuery(contentId);

//     const [addNote, { isLoading: isCreating }] = useAddNoteMutation();
//     const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();

//     const isLoading = isCreating || isUpdating || isLoadingNote;

//     useEffect(() => {
//         if (!noteData || isLoadingNote) return;

//         const note = noteData?.note;
//         if (note?._id) setExistingNoteId(note._id);
//         if (note?.title) setTitle(note.title);

//         const defaultLexicalContent = {
//             root: {
//                 children: [
//                     {
//                         type: 'paragraph',
//                         children: [
//                             {
//                                 text: note?.description || '',
//                                 type: 'text',
//                             },
//                         ],
//                         direction: null,
//                         format: '',
//                         indent: 0,
//                         version: 1,
//                     },
//                 ],
//                 direction: null,
//                 format: '',
//                 indent: 0,
//                 type: 'root',
//                 version: 1,
//             },
//         };

//         try {
//             const parsed = JSON.parse(note?.content || '{}');
//             if (parsed?.root) {
//                 setNotes(note.content || '');
//                 setParsedContent(parsed);
//             } else {
//                 setNotes(JSON.stringify(defaultLexicalContent));
//                 setParsedContent(defaultLexicalContent);
//             }
//         } catch {
//             setNotes(JSON.stringify(defaultLexicalContent));
//             setParsedContent(defaultLexicalContent);
//         }
//     }, [noteData, isLoadingNote]);

//     useEffect(() => {
//         if (notes.trim()) {
//             try {
//                 const parsed = JSON.parse(notes);
//                 setParsedContent(parsed);
//             } catch {
//                 setParsedContent(null);
//             }
//         } else {
//             setParsedContent(null);
//         }
//     }, [notes]);

//     const handleSubmit = async (e: FormEvent) => {
//         e.preventDefault();

//         if (!title.trim()) {
//             toast.warning('Please enter a title.');
//             return;
//         }

//         if (!notes.trim()) {
//             toast.warning('Please enter some note content.');
//             return;
//         }

//         const description =
//             parsedContent?.root?.children?.[0]?.children?.[0]?.text || '';

//         const payload: Partial<TNote> = {
//             title: title.trim(),
//             description,
//             content: notes,
//             purpose: {
//                 category: '',
//                 resourceId: contentId,
//             },
//         };

//         try {
//             if (existingNoteId) {
//                 await updateNote({
//                     id: existingNoteId,
//                     data: payload,
//                 }).unwrap();
//                 toast.success('Note updated successfully!');
//             } else {
//                 const newNote = await addNote(payload).unwrap();
//                 if (newNote?._id) setExistingNoteId(newNote._id);
//                 toast.success('Note created successfully!');
//             }

//             setShowSavedMessage(true);
//             setIsEditingNotes(false);
//         } catch (error) {
//             console.error('Error saving note:', error);
//             toast.error('Failed to save note.');
//         }
//     };

//     const handleCancel = () => {
//         setIsEditingNotes(false);
//         if (noteData?.note) {
//             setTitle(noteData.note.title || '');
//             setNotes(noteData.note.content || '');
//         } else {
//             setTitle('');
//             setNotes('');
//         }
//     };

//     const renderNotesContent = () => {
//         if (!notes || !parsedContent?.root?.children) {
//             return <p className='text-gray-500'>No notes to display.</p>;
//         }

//         return parsedContent.root.children.map((block: any, idx: number) => {
//             if (block.type === 'paragraph') {
//                 const text = block.children
//                     .map((child: any) => child.text || '')
//                     .join('');
//                 return (
//                     <p key={idx} className={idx === 0 ? 'mt-0' : 'mt-4'}>
//                         {text || <br />}
//                     </p>
//                 );
//             }
//             return (
//                 <p key={idx} className='text-gray-500'>
//                     Content available in editor view
//                 </p>
//             );
//         });
//     };

//     return (
//         <div className='py-2'>
//             <div className='flex justify-between items-center mb-2'>
//                 <h3 className='text-lg font-medium text-black'>Your Notes</h3>
//                 {isEditingNotes ? (
//                     <Button
//                         variant='outline'
//                         type='button'
//                         onClick={handleCancel}
//                         disabled={isLoading}
//                         className='flex items-center gap-1 text-dark-gray hover:bg-background'
//                     >
//                         <XIcon size={18} />
//                         Cancel
//                     </Button>
//                 ) : (
//                     <Button
//                         type='button'
//                         onClick={() => setIsEditingNotes(true)}
//                         disabled={isLoading}
//                         className='flex items-center gap-1'
//                     >
//                         <FileText size={18} />
//                         Edit
//                     </Button>
//                 )}
//             </div>

//             {showSavedMessage && (
//                 <div className='mb-4 p-2 bg-background text-green-700 rounded-md flex items-center gap-2'>
//                     <svg
//                         width='20'
//                         height='20'
//                         viewBox='0 0 24 24'
//                         fill='none'
//                         xmlns='http://www.w3.org/2000/svg'
//                     >
//                         <path
//                             d='M5 13L9 17L19 7'
//                             stroke='currentColor'
//                             strokeWidth='2'
//                             strokeLinecap='round'
//                             strokeLinejoin='round'
//                         />
//                     </svg>
//                     Notes saved successfully!
//                 </div>
//             )}

//             {isLoadingNote ? (
//                 <div className='border border-border rounded-md p-4 flex justify-center items-center h-52'>
//                     <span className='text-gray-500'>Loading notes...</span>
//                 </div>
//             ) : isEditingNotes ? (
//                 <form
//                     onSubmit={handleSubmit}
//                     className='border border-border p-4 rounded-md space-y-4'
//                 >
//                     <div>
//                         <Label htmlFor='note-title'>Title</Label>
//                         <Input
//                             id='note-title'
//                             value={title}
//                             onChange={(e) => setTitle(e.target.value)}
//                             placeholder='Enter title'
//                             required
//                         />
//                     </div>

//                     <div>
//                         <Label>Note Content</Label>
//                         <GlobalBlockEditor value={notes} onChange={setNotes} />
//                     </div>

//                     <Button type='submit' disabled={isLoading}>
//                         {existingNoteId ? 'Update Note' : 'Save Note'}
//                     </Button>
//                 </form>
//             ) : (
//                 <div className='border border-border rounded-md p-4'>
//                     {renderNotesContent()}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AddNotes;

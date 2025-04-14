'use client';

import { useState } from 'react';
import { DocumentCard } from './document-card';
import { UploadDocumentModal } from './upload-document-modal';
import { MyDocumentDetailsModal } from './MyDocumentDetailsModal';

interface Document {
    id: string;
    title: string;
    author: string;
    date: string;
    readTime: number;
    categories: string[];
    imageUrl: string;
}

interface DocumentListProps {
    documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // New state for upload modal

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
    };

    const handleOpenUploadModal = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    return (
        <div>
            {/* Upload Button */}
            <div className='flex justify-end mb-4'>
                <button
                    onClick={handleOpenUploadModal}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2'
                >
                    Upload Document
                </button>
            </div>

            {/* Document Grid */}
            <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {documents.map((doc) => (
                    <DocumentCard
                        key={doc.id}
                        {...doc}
                        onClick={() => handleDocumentClick(doc.id)}
                    />
                ))}
            </div>

            {/* Modals */}
            <MyDocumentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                documentId={selectedDocumentId}
            />
            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={handleCloseUploadModal}
            />
        </div>
    );
}

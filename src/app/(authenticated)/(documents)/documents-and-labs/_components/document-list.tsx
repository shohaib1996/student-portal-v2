'use client';

import { useState } from 'react';
import { DocumentCard } from './document-card';
import { DocumentAndLabsDetailsModal } from './DocumentAndLabsDetailsModal';

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDocumentClick = (documentId: string) => {
        setSelectedDocumentId(documentId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className='my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {documents.map((doc) => (
                    <DocumentCard
                        key={doc.id}
                        {...doc}
                        onClick={() => handleDocumentClick(doc.id)}
                    />
                ))}
            </div>

            <DocumentAndLabsDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                documentId={selectedDocumentId}
            />
        </div>
    );
}

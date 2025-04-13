import UploadDocumentComponent from './_components/upload-documents-component';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Upload Documents | BootcampsHub Portal',
    description: 'Securely upload and manage your files of BootcampsHub Portal',
};

export default function UploadDocumentsPage() {
    return <UploadDocumentComponent />;
}

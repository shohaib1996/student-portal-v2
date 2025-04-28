type Attachment = {
    name: string; // Required
    type?: string; // Optional - File type/MIME type
    size?: number; // Optional - File size in bytes
    url: string; // Required - URL to the attachment
};

type Purpose = {
    category: string; // e.g., "module", "document"
    resourceId: string; // ID of the related resource
};

export type TNote = {
    _id: string;
    title: string;
    description: any; // Could be string, object, or any rich text format
    user: string; // ObjectId as string
    branch: string; // ObjectId as string
    enrollment: string; // ObjectId as string
    purpose: Purpose;
    tags: string[];
    thumbnail?: string;
    attachments?: Attachment[];
    createdAt: Date;
    updatedAt: Date;
};

export interface NoteResponse {
    notes: TNote[];
    success: boolean;
    pagination: {
        total: number;
        currentPage: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
        limit: number;
    };
}

export interface TMediaItem {
    description: string;
    attachments: string[];
    mediaType: 'video' | 'image' | 'audio' | 'document';
    users: string[];
    category: string;
    branches: string[];
    _id: string;
    title: string;
    url: string;
    thumbnail: string;
    createdBy: {
        profilePicture: string;
        lastName: string;
        _id: string;
        firstName: string;
        fullName: string;
    };
    organization: string;
    comments: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

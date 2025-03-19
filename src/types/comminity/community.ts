export interface ITags {
    name: string;
    count: number;
}

export interface ICommunityUser {
    profilePicture: string;
    lastName: string;
    _id: string;
    firstName: string;
    fullName: string;
}

export interface IUserWithCount {
    user: ICommunityUser;
    count: number;
}

export interface IAttachment {
    _id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    createdAt: string;
}

export interface ICommunityPost {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    createdBy: {
        profilePicture: string;
        lastName: string;
        _id: string;
        firstName: string;
        fullName: string;
    };
    attachments: IAttachment[]; // You can replace `any[]` with a more specific type if needed
    reactions: Record<string, unknown>; // Assuming reactions can have various keys
    createdAt: string; // ISO timestamp
    commentsCount: number;
    reactionsCount: number;
    myReaction: string | null;
    isSaved: boolean;
    isReported: boolean;
}

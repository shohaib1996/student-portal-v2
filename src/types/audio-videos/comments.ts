interface TUser {
    profilePicture: string;
    lastName: string;
    _id: string;
    firstName: string;
    fullName: string;
}

export interface TComment {
    _id: string;
    contentId: string;
    comment: string;
    user: TUser;
    createdAt: string;
    updatedAt: string;
    __v: number;
    repliesCount: number;
    parentId?: string;
}

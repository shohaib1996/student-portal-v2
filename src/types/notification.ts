export type TNotification = {
    categories: string[];
    createdAt: string;
    entityId?: string;
    generatedText?: string;
    generatedTitle?: string;
    indentifier?: string;
    notificationType?: string;
    opened?: boolean;
    text?: string;
    updatedAt: string;
    userFrom?: {
        firstName?: string;
        fullName?: string;
        lastName?: string;
        profilePicture?: string;
        _id: string;
    };
    userTo?: {
        firstName?: string;
        fullName?: string;
        lastName?: string;
        profilePicture?: string;
        _id: string;
    };
    variables?: {
        NAME: string;
        OBJECTID: string;
        _id: string;
        __v: number;
    };
    _id: string;
};

export type IAuthUser = {
    _id: string;
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    isApproved: boolean;
    isDemo: boolean;
    type: string;
    about: string;
    profilePicture: string;
    createdAt: string;
    updatedAt: string;
    lastActive: string;
    deviceToken: string;
    isLockExcluded: boolean;
    readingLists: any[]; // Update this type if you have a structure for reading lists

    phone: {
        isVerified: boolean;
        number: string;
        countryCode: string;
    };

    isEmailVerified: {
        status: boolean;
        token: string;
    };

    family: Record<string, unknown>; // If `family` has a structure, define it explicitly

    chatPermissions: {
        isSuspended: boolean;
        canJoinChat: boolean;
        canInitiateChat: boolean;
        canCreateChannel: boolean;
        canReadMessage: boolean;
        canSendMessage: boolean;
    };

    suspension: {
        isSuspended: boolean;
        suspendedUntil: string | null;
        reason: string;
    };

    botInfo: {
        branches: any[]; // Define structure if needed
        description: string;
        isActive: boolean;
    };

    personalData: {
        address: {
            country: string;
            city: string;
            street: string;
            postalCode: string;
            state: string;
        };
        socialMedia: {
            facebook: string;
            twitter: string;
            linkedin: string;
            instagram: string;
            github: string;
        };
        resume: string;
        bio: string;
    };

    profileStatus: {
        recurring: {
            isDailyRecurring: boolean;
            fromTime: string | null;
            toTime: string | null;
        };
        currentStatus: string;
    };
};

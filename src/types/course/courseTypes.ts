export type TCourse = {
    _id: string;
    status: 'pending' | 'active' | 'inactive'; // Adjust based on possible statuses
    amount: number;
    course: {
        image: string | null;
        type: 'course';
        _id: string;
        title: string;
        slug: string;
        instructor: {
            _id: string;
            name: string;
        };
    };
    user: string;
    organization: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    __v: number;
    paid: number; // Consider using boolean if it's only 0 or 1
};

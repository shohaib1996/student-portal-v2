export interface TCourseEnrollment {
    _id: string;
    status: string;
    amount: number;
    course: {
        image: string | null;
        type: string;
        _id: string;
        title: string;
        slug: string;
        instructor: { _id: string; name: string } | string;
    };
    user: string;
    organization: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    paid: number;
}

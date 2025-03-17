import { baseApi } from '../baseApi';

export interface LabContent {
    _id: string;
    title: string;
    description: string;
    // Add other fields as per your API response
}

export interface LabContentResponse {
    contents: LabContent[];
    success: boolean;
    count: number;
}

export interface Author {
    firstName: string;
    fullName: string;
    lastName: string;
    profilePicture: string;
    _id: string;
}

export interface MyDocument {
    description: string;
    attachment: File[] | string[];
    user: string;
    priority: 'low' | 'medium' | 'high';
    category: string[];
    branches: string[];
    _id: string;
    name: string;
    createdBy: Author;
    thumbnail: File | string | null;
    organization: string;
    comments: {
        user: string;
        text: string;
        createdAt: string | Date;
    }[];
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface MyDocumentResponse {
    documents: MyDocument[];
    success: boolean;
    count: number;
}

export interface ContentDetailsResponse {
    success: boolean;
    content: {
        name: string;
        description: string;
        category: string;
        tags: string[];
        attachments: string[];
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        thumbnail: string;
    };
}

export interface CommentedUser {
    profilePicture: string;
    lastName: string;
    _id: string;
    firstName: string;
    fullName: string;
}

export interface SingleComment {
    _id: string;
    contentId: string;
    comment: string;
    user: CommentedUser;
    createdAt: string;
    updatedAt: string;
    __v: number;
    repliesCount: number;
}

export interface CommentResponse {
    success: boolean;
    comments: SingleComment[];
    totalCount: number;
}

const documentsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getLabContent: build.query<
            LabContentResponse,
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 8 }) => ({
                url: '/content/labcontent',
                params: { page, limit },
            }),
        }),
        getMyDocument: build.query<
            MyDocumentResponse,
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 8 }) => ({
                url: '/document/mydocuments',
                params: { page, limit },
            }),
        }),
        getContentDetails: build.query<ContentDetailsResponse, string>({
            query: (id) => ({ url: `/content/getcontent/${id}` }),
        }),
        getDocumentComments: build.query<CommentResponse, string>({
            query: (id) => ({ url: `/content/comment/get/${id}` }),
        }),
    }),

    overrideExisting: false,
});

export const {
    useGetLabContentQuery,
    useGetMyDocumentQuery,
    useGetContentDetailsQuery,
    useGetDocumentCommentsQuery,
} = documentsApi;

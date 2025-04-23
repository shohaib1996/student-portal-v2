import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

export interface LabContent {
    _id: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    groups: string[];
    isFree: boolean;
    isLocked: boolean;
    name: string;
    thumbnail: string;
    description?: string;
    createdBy?: { _id: string; fullName: string; profilePicture: string };
}

export interface LabContentResponse {
    contents: LabContent[];
    success: boolean;
    count: number;
}

export interface MyDocument {
    _id: string;
    name: string;
    description: string;
    attachment: File[] | string[];
    user: string;
    priority: 'low' | 'medium' | 'high';
    category: string[];
    branches: string[];
    createdBy: {
        _id: string;
        fullName: string;
        firstName: string;
        lastName: string;
        profilePicture: string;
    };
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
    pagination?: {
        currentPage: number;
        hasNext: boolean;
        hasPrev: boolean;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UploadDoc {
    _id: string;
    name: string;
    description: string;
    branch: string;
    enrollment: string;
    user: string;
    createdAt: string;
    updatedAt: string;
    attachment: any[];
    thumbnail: string;
    comments: any[];
}

export interface UploadDocumentResponse {
    success: boolean;
    documents: UploadDoc[];
    count: number;
}

export interface UploadDocumentFileResponse {
    success: boolean;
    fileUrl?: string;
}

export interface MySlide {
    _id: string;
}
export interface MySlidesResponse {
    success: boolean;
    slides: MySlide[];
    count: number;
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
            {
                page?: number;
                limit?: number;
                query?: string;
                priority?: string;
                createdAt?: string | Date;
            }
        >({
            query: ({ page = 1, limit = 8, query, priority, createdAt }) => ({
                url: '/document/mydocuments',
                params: { page, limit, query, priority, createdAt },
            }),
        }),
        getMyDocumentById: build.query<any, string>({
            query: (documentId) => ({
                url: `/document/get/${documentId}`,
            }),
            providesTags: (result, error, id) => [
                { type: tagTypes.documents, id },
            ],
        }),

        getMySlides: build.query<
            MySlidesResponse,
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 8 }) => ({
                url: '/slide/myslides',
                params: { page, limit },
            }),
        }),
        getMyTemplates: build.query<
            { success: boolean; templates: any; count: number },
            void
        >({
            query: () => ({
                url: '/template/mytemplates',
            }),
        }),
        getTemplateDetails: build.query<
            { success: boolean; template: any },
            string
        >({
            query: (id) => ({ url: `/template/get/${id}` }),
        }),
        getContentDetails: build.query<
            { success: boolean; content: any },
            string
        >({
            query: (id) => ({ url: `/content/getcontent/${id}` }),
        }),
        getDocumentComments: build.query<
            { success: boolean; comments: any[]; totalCount: number },
            string
        >({
            query: (id) => ({ url: `/content/comment/get/${id}` }),
        }),
        uploadUserDocumentFile: build.mutation<
            UploadDocumentFileResponse,
            FormData
        >({
            query: (formData) => ({
                url: '/document/userdocumentfile',
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                data: formData,
            }),
            invalidatesTags: [tagTypes.documents],
        }),
        addUserDocument: build.mutation({
            query: (documentData) => ({
                url: '/document/userdocument/add',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: documentData,
            }),
            invalidatesTags: [tagTypes.documents],
        }),
        getUploadDocuments: build.query<
            UploadDocumentResponse,
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 8 }) => ({
                url: '/document/userdocument/get',
                params: { page, limit },
            }),
            providesTags: [tagTypes.documents],
        }),
        getSingleUploadDocument: build.query({
            query: (id) => ({
                url: `/document/userdocument/get/${id}`,
            }),
            providesTags: (result, error, id) => [
                { type: tagTypes.documents, id },
            ],
        }),
        updateUserDocument: build.mutation<
            { success: boolean },
            { id: string; data: any }
        >({
            query: ({ id, data }) => ({
                url: `/document/userdocument/update/${id}`,
                method: 'PATCH',
                data: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: tagTypes.documents, id },
                tagTypes.documents,
                { type: tagTypes.documents, id },
            ],
        }),
        deleteUserDocument: build.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/document/userdocument/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [tagTypes.documents],
        }),
        // getMySingleDocument: build.query<any, any>({
        //     query: (id) => ({
        //         url: `/document/userdocument/get/${id}`,
        //     }),
        // }),
        getMySingleDocument: build.query<any, any>({
            query: (id) => ({
                url: `/document/get/${id}`,
            }),
        }),
        getSingleUpdatedDocumentById: build.query<any, any>({
            query: (id) => ({
                url: `/document/userdocument/get/${id}`,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetLabContentQuery,
    useGetMyDocumentQuery,
    useGetMyDocumentByIdQuery,
    useGetContentDetailsQuery,
    useGetDocumentCommentsQuery,
    useGetMyTemplatesQuery,
    useGetTemplateDetailsQuery,
    useGetUploadDocumentsQuery,
    useAddUserDocumentMutation,
    useUploadUserDocumentFileMutation,
    useDeleteUserDocumentMutation,
    useUpdateUserDocumentMutation,
    useGetMySlidesQuery,
    useGetMySingleDocumentQuery,
    useGetSingleUpdatedDocumentByIdQuery,
    useGetSingleUploadDocumentQuery,
} = documentsApi;

export default documentsApi;

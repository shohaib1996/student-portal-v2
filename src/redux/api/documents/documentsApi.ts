import { baseApi } from '../baseApi';

export interface LabContent {
    id: string;
    title: string;
    description: string;
    // Add other fields as per your API response
}

export interface LabContentResponse {
    data: LabContent[];
    total: number;
    page: number;
    limit: number;
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
    }),

    overrideExisting: false,
});

export const { useGetLabContentQuery } = documentsApi;

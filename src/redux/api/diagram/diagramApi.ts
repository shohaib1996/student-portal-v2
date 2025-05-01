import { DiagramType } from '@/types/diagram';
import { baseApi } from '../baseApi';

export interface MyDiagramResponse {
    success: boolean;
    count: number;
    pagination: {
        total: number;
        currentPage: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
        limit: number;
    };
    diagrams: DiagramType[];
}

const diagramApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMyDiagram: build.query({
            query: ({ page, limit, query, createdAt }) => ({
                url: '/diagram/mydiagrams',
                params: { page, limit, query, createdAt },
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useGetMyDiagramQuery } = diagramApi;

export default diagramApi;

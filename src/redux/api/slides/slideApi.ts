import { baseApi } from '../baseApi';

const slideApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getSingleSlide: build.query({
            query: ({ id }: { id: string | null | undefined }) => ({
                url: `/slide/single/${id}`,
                method: 'GET',
            }),
        }),
        getDocumentsAndLabs: build.query({
            query: ({ id }: { id: string }) => ({
                url: `/content/getcontent/${id}`,
                method: 'GET',
            }),
        }),
        getSlides: build.query({
            query: ({
                page,
                query = '',
                limit,
            }: {
                page: number;
                query?: string;
                limit?: number;
            }) => ({
                url: `/slide/myslides?page=${page || 1}&limit=${limit || 8}&query=${query}`,
                method: 'GET',
            }),
        }),
        getSingleSlides: build.query({
            query: ({ _id }: { _id?: string | undefined | null }) => ({
                url: `/slide/single/${_id}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetSingleSlideQuery,
    useGetDocumentsAndLabsQuery,
    useGetSlidesQuery,
    useGetSingleSlidesQuery,
} = slideApi;

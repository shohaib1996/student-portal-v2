import { string } from 'zod';
import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

const notesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getNotes: build.query({
            query: () => ({
                url: '/content/note/mynotes',
                method: 'GET',
            }),
            providesTags: [tagTypes.notes],
        }),
        addNote: build.mutation({
            query: (data: any) => ({
                url: `/content/note/create`,
                method: 'POST',
                data,
            }),
            invalidatesTags: [tagTypes.notes],
        }),
    }),
});

export const { useGetNotesQuery, useAddNoteMutation } = notesApi;

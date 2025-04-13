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
        getSingleNote: build.query({
            query: (id: string) => ({
                url: `/content/note/get/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [
                { type: tagTypes.notes, id },
                tagTypes.notes,
            ],
        }),
        updateNote: build.mutation({
            query: ({ id, data }: { id: string; data: any }) => ({
                url: `/content/note/edit/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, id) => [
                ...(result && { type: tagTypes.notes, id }),
                tagTypes.notes,
            ],
        }),
        deleteNote: build.mutation({
            query: (id: string) => ({
                url: `/content/note/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [tagTypes.notes],
        }),
    }),
});

export const {
    useGetNotesQuery,
    useAddNoteMutation,
    useGetSingleNoteQuery,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
} = notesApi;

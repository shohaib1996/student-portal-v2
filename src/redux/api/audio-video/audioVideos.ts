import { baseApi } from '../baseApi';

const myAudioVideo = baseApi.injectEndpoints({
    endpoints: (build) => ({
        myAudioVideo: build.query({
            query: (params: any) => ({
                url: 'media/mymedia',
                method: 'GET',
                params,
            }),
        }),
        createComments: build.mutation({
            query: (payload) => ({
                url: `/content/comment/create`,
                method: 'POST',
                data: payload,
            }),
            invalidatesTags: ['Comments'],
        }),
        deleteComments: build.mutation({
            query: (id) => ({
                url: `/content/comment/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Comments'],
        }),
        getAllMeidaComments: build.query({
            query: (id) => ({
                url: `/content/comment/get/${id}`,
                method: 'GET',
            }),
            providesTags: ['Comments'],
        }),
        updateComment: build.mutation({
            query: (payload) => ({
                url: `/content/comment/update/${payload.commentId}`,
                method: 'PATCH',
                data: payload,
            }),
            invalidatesTags: ['Comments'],
        }),
        createReplies: build.mutation({
            query: (payload) => ({
                url: `/content/comment/create`,
                method: 'POST',
                data: payload,
            }),
            invalidatesTags: ['Replies'],
        }),
        getAllMeidaReplies: build.query({
            query: (payload) => ({
                url: `/content/comment/get/${payload.contentId}?parentId=${payload.parentId}`,
                method: 'GET',
            }),
            providesTags: ['Replies'],
        }),
        updateReplies: build.mutation({
            query: (payload) => {
                return {
                    url: `/content/comment/update/${payload.id}`,
                    method: 'PATCH',
                    data: payload.data,
                };
            },
            invalidatesTags: ['Replies'],
        }),
        deleReplies: build.mutation({
            query: (id) => ({
                url: `/content/comment/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Replies', 'Comments'],
        }),
    }),
});

export const {
    useMyAudioVideoQuery,
    useGetAllMeidaCommentsQuery,
    useGetAllMeidaRepliesQuery,
    useCreateCommentsMutation,
    useDeleteCommentsMutation,
    useUpdateCommentMutation,
    useCreateRepliesMutation,
    useUpdateRepliesMutation,
    useDeleRepliesMutation,
} = myAudioVideo;

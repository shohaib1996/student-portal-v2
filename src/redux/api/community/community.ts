import { baseApi } from '../baseApi';

const community = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createPost: build.mutation({
            query: ({ payload }) => ({
                url: '/content/community/post/create',
                method: 'POST',
                data: payload,
            }),
        }),
        getCommunityPostsApi: build.mutation({
            query: ({ payload }) => ({
                url: `/content/community/post/getall`,
                method: 'POST',
                data: payload,
            }),
        }),
        editCommunityPostsApi: build.mutation({
            query: ({ payload, id }) => ({
                url: `/content/community/post/edit/${id}`,
                method: 'PATCH',
                data: payload,
            }),
        }),
        deleteCommunityPostsApi: build.mutation({
            query: ({ id }) => ({
                url: `content/community/post/delete/${id}`,
                method: 'DELETE',
            }),
        }),
        getTopTagsApi: build.query({
            query: () => ({
                url: '/content/community/top-tags',
                method: 'GET',
            }),
        }),
        getTopContributersApi: build.query({
            query: () => ({
                url: '/content/community/top-users',
                method: 'GET',
            }),
        }),
        provideReactionApi: build.mutation({
            query: ({ payload, id }) => ({
                url: `/content/community/post/react/${id}`,
                method: 'PUT',
                data: payload,
            }),
        }),
        savePostApi: build.mutation({
            query: ({ payload }) => ({
                url: '/content/community/post/option/save',
                method: 'POST',
                data: payload,
            }),
        }),
    }),
});

export const {
    useCreatePostMutation,
    useGetTopTagsApiQuery,
    useGetTopContributersApiQuery,
    useGetCommunityPostsApiMutation,
    useProvideReactionApiMutation,
    useDeleteCommunityPostsApiMutation,
    useEditCommunityPostsApiMutation,
    useSavePostApiMutation,
} = community;

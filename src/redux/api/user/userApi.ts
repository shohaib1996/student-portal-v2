import { baseApi } from '../baseApi';

const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        uploadImage: build.mutation({
            query: (data) => ({
                url: '/user/updateimage',
                method: 'PATCH',
                data: data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }),
            invalidatesTags: ['User'],
        }),
        updateUserInfo: build.mutation({
            query: (data) => ({
                url: '/user/updateuser',
                method: 'PATCH',
                data: data,
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const { useUploadImageMutation, useUpdateUserInfoMutation } = userApi;

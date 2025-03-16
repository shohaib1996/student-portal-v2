import { baseApi } from '../baseApi';

const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        loginUser: build.mutation({
            query: (data) => ({
                overrideExisting: true,
                url: '/user/login',
                method: 'POST',
                data: data,
                headers: {},
            }),
        }),
        registerUser: build.mutation({
            query: (data) => ({
                overrideExisting: true,
                url: '/user/register',
                method: 'POST',
                data: data,
                headers: {},
            }),
        }),
        verifyUser: build.mutation({
            query: (data) => ({
                url: '/user/verify',
                method: 'POST',
                data: data,
            }),
        }),
        getOrganizations: build.query({
            query: () => ({
                url: 'organization/user-organizations',
                methods: 'GET',
            }),
        }),
    }),

    overrideExisting: false,
});

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useVerifyUserMutation,
    useGetOrganizationsQuery,
} = authApi;

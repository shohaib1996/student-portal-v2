import { baseApi } from '../baseApi';

const myProgram = baseApi.injectEndpoints({
    endpoints: (build) => ({
        myProgram: build.query({
            query: (data) => ({
                url: '/enrollment/myprogram',
                method: 'GET',
            }),
        }),
        getAgreement: build.query({
            query: () => ({
                url: '/enrollment/agreement',
                method: 'GET',
            }),
        }),
        getMyTerm: build.query({
            query: ({ data }) => ({
                url: '/terms-conditions/myterm',
                method: 'POST',
                data: data,
            }),
        }),
        getMyProgress: build.query({
            query: () => ({
                url: '/progress/myprogress',
                method: 'GET',
            }),
        }),
    }),

    overrideExisting: false,
});

export const {
    useMyProgramQuery,
    useGetAgreementQuery,
    useGetMyTermQuery,
    useGetMyProgressQuery,
} = myProgram;

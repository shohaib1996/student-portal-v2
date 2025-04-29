import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

const technicalTests = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTechnicalTests: build.query({
            query: (params) => ({
                url: '/assignment/myassignments',
                method: 'GET',
                params,
            }),
            providesTags: [tagTypes.technicalTests],
        }),
    }),
});

export const { useGetTechnicalTestsQuery } = technicalTests;

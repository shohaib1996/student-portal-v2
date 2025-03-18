import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

const technicalTests = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTechnicalTests: build.query({
            query: (data) => ({
                url: '/assignment/myassignments',
                method: 'POST',
                data: data,
            }),
            providesTags: [tagTypes.technicalTests],
        }),
    }),
});

export const { useGetTechnicalTestsQuery } = technicalTests;

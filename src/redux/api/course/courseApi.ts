import { baseApi } from '../baseApi';

const courseApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllCourses: build.query({
            query: () => ({
                url: '/order/myorder/course',
                method: 'GET',
            }),
        }),
    }),
});

export const { useGetAllCoursesQuery } = courseApi;

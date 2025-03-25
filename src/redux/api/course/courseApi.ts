import { baseApi } from '../baseApi';

const courseApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllCourses: build.query({
            query: () => ({
                url: '/order/myorder/course',
                method: 'GET',
            }),
        }),
        courseContent: build.query({
            query: (data: { slug: string }) => ({
                url: `course/contentv2/${data?.slug}`,
                method: 'GET',
            }),
        }),
        courseReview: build.query({
            query: (data: { programId: string }) => ({
                url: `course/review/myreview/${data?.programId}`,
                method: 'GET',
            }),
            providesTags: (result) =>
                result ? [{ type: 'Comments', id: result.programId }] : [], // Ensures the correct tag is provided
        }),
        updateReview: build.mutation({
            query: (data: {
                reviewId: string;
                body: {
                    starCount: number;
                    text: string;
                };
            }) => ({
                url: `/course/review/update/${data?.reviewId}`,
                method: 'PATCH',
                data: data?.body,
            }),
            invalidatesTags: (result, error, { reviewId }) => [
                { type: 'Comments', id: reviewId }, // Invalidate the review specifically
            ],
        }),
        postCoursePrograms: build.mutation({
            query: (data: {
                slug: string;
                contentId: string;
                body: {
                    parent?: string | null;
                    queryText?: string;
                    filterBy?: string;
                };
            }) => ({
                url: `course/chapterv2/get/${data.slug}/${data.contentId}`,
                method: 'POST',
                data: data.body || {
                    parent: null,
                    queryText: '',
                    filterBy: '',
                },
            }),
        }),
        submitReview: build.mutation({
            query: (data) => ({
                url: 'course/review/submit',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Comments'],
        }),
        trackChapter: build.mutation({
            query: ({ courseId, action, chapterId }) => ({
                url: `course/chapterv2/track/${courseId}`,
                method: 'POST',
                data: { action, chapterId },
            }),
        }),
    }),
});

export const {
    useGetAllCoursesQuery,
    useCourseContentQuery,
    usePostCourseProgramsMutation,
    useCourseReviewQuery,
    useUpdateReviewMutation,
    useSubmitReviewMutation,
    useTrackChapterMutation,
} = courseApi;

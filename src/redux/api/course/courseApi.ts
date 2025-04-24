import { baseApi } from '../baseApi';
import { tagTypes } from '../tagType/tagTypes';

const courseApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllCourses: build.query({
            query: () => ({
                url: '/order/myorder/course',
                method: 'GET',
            }),
        }),
        getAllCoursePrograms: build.query({
            query: (data: { slug: string; categoryID: string }) => ({
                url: `/course/chapterv2/mychapters/${data?.slug}/${data?.categoryID}  
`,
                method: 'GET',
            }),
        }),
        getSingleChapter: build.query({
            query: (chapterID: string) => ({
                url: `/course/chapterv2/get-single/chapter/${chapterID}   
`,
                method: 'GET',
            }),
        }),

        courseContent: build.query({
            query: (data: { slug: string }) => ({
                url: `course/contentv2/${data?.slug}`,
                method: 'GET',
            }),
        }),
        getCourseReview: build.query({
            query: (_id: string) => ({
                url: `/course/review/myreview/${_id}`,
                method: 'GET',
            }),
            providesTags: [tagTypes.review], // Ensures the correct tag is provided
        }),
        getAllCourseReview: build.query({
            query: () => ({
                url: `/course/review/get/6647be35e44f020019e06b65?fields=["categories","reviews"]&category=ssss&page=1&limit=10`,
                method: 'GET',
            }),
            providesTags: [tagTypes.review], // Ensures the correct tag is provided
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
            invalidatesTags: [tagTypes.review],
        }),
        postCoursePrograms: build.mutation({
            query: (data: {
                slug: string;
                contentId: string;
                body?: {
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
            invalidatesTags: [tagTypes.review, 'Comments'],
        }),
        trackChapter: build.mutation({
            query: ({ courseId, action, chapterId }) => ({
                url: `course/chapterv2/track/${courseId}`,
                method: 'POST',
                data: { action, chapterId },
            }),
            invalidatesTags: [tagTypes.course],
        }),

        getQuizForLesson: build.query({
            query: ({
                lessonUrl,
                lessonId,
            }: {
                lessonUrl: string;
                lessonId: string;
            }) => ({
                url: `/interviewqa/question/getactive/${lessonUrl}?source=${lessonId}`,
                method: 'GET',
            }),
        }),
        submitQuizForLesson: build.query({
            query: ({
                interviewId,
                payload,
            }: {
                interviewId: string;
                payload: any;
            }) => ({
                url: `/interviewqa/answer/submit/${interviewId}`,
                method: 'POST',
                data: payload,
            }),
        }),
    }),
});

export const {
    useGetAllCoursesQuery,
    useCourseContentQuery,
    usePostCourseProgramsMutation,
    useGetCourseReviewQuery,
    useUpdateReviewMutation,
    useSubmitReviewMutation,
    useTrackChapterMutation,
    useGetAllCourseReviewQuery,
    useGetAllCourseProgramsQuery,
    useGetSingleChapterQuery,
    useGetQuizForLessonQuery,
    useSubmitQuizForLessonQuery,
} = courseApi;

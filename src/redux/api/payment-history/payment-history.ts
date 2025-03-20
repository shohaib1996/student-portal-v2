import { baseApi } from '../baseApi';

const paymentHistory = baseApi.injectEndpoints({
    endpoints: (build) => ({
        paymentHistoryApi: build.query({
            query: () => ({
                url: '/transaction/mytransaction',
                method: 'GET',
            }),
            providesTags: ['Payment History'],
        }),
        addPaymentApi: build.mutation({
            query: ({ payload }) => ({
                url: '/transaction/addbyuser',
                method: 'POST',
                data: payload,
            }),
            invalidatesTags: ['Payment History'],
        }),
        getPaymentDetailsById: build.query({
            query: (id) => ({
                url: `/order/details/${id}`,
                method: 'GET',
            }),
            providesTags: ['Payment History Id'],
        }),
        addPaymentById: build.mutation({
            query: ({ payload, id }) => ({
                url: `order/addpayment/${id}`,
                method: 'POST',
                data: payload,
            }),
            invalidatesTags: ['Payment History Id'],
        }),
    }),
});

export const {
    usePaymentHistoryApiQuery,
    useAddPaymentApiMutation,
    useGetPaymentDetailsByIdQuery,
    useAddPaymentByIdMutation,
} = paymentHistory;

import {
    TBootcampResult,
    TBottomChartCommunity,
    TBottomChartFamilyMember,
    TBottomChartLastPassword,
    TBottomChartReview,
    TBottomChartTotalTemplates,
    TCalendar,
    TCalendarChartApiResponse,
    TCalendarData,
    TMessagesRes,
    TMockInterview,
    TShowNTellChartApiResponse,
    TTechnicalTestsApiResponse,
} from '@/types';
export interface TChatData {
    showTell: TShowNTellChartApiResponse;
    calendar: TCalendar;
    assignment: TTechnicalTestsApiResponse;
    mockInterview: TMockInterview;
    community: TBottomChartCommunity;
    lastPasswordUpdate: TBottomChartLastPassword;
    template: TBottomChartTotalTemplates;
    review: TBottomChartReview;
    familyMember: TBottomChartFamilyMember;
    bootcamp: {
        success: boolean;
        results: TBootcampResult[];
    };

    message: TMessagesRes;
}

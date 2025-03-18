export interface TBottomChartCommunityResult {
    totalCommintyPost: number;
}
export interface TBottomChartLastPasswordUpdateResult {
    lastPasswordUpdate: null | number;
}
export interface TBottomChartTotalTemplatesResult {
    totalTemplates: number;
}
export interface TBottomChartReviewResult {
    totalReviews: number;
}
export interface TBottomChartFamilyMemberResult {
    familyMemberCount: number;
}

export interface TBottomChartCommunity {
    success: boolean;
    results: TBottomChartCommunityResult;
}
export interface TBottomChartLastPassword {
    success: boolean;
    results: TBottomChartLastPasswordUpdateResult;
}
export interface TBottomChartTotalTemplates {
    success: boolean;
    results: TBottomChartTotalTemplatesResult;
}
export interface TBottomChartReview {
    success: boolean;
    results: TBottomChartReviewResult;
}
export interface TBottomChartFamilyMember {
    success: boolean;
    results: TBottomChartFamilyMemberResult;
}
//  combine all
export interface TBottomChartData {
    community: TBottomChartCommunity;
    lastPasswordUpdate: TBottomChartLastPassword;
    template: TBottomChartTotalTemplates;
    review: TBottomChartReview;
    familyMember: TBottomChartFamilyMember;
}

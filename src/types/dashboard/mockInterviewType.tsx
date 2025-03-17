export interface TMockInterviewResult {
    completed: number;
    pending: number;
    submitted: number;
    totalInterview: number;
}
export interface TMockInterview {
    result: TMockInterviewResult;
    success: boolean;
}

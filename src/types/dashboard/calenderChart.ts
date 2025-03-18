// Type for the `results` object
export interface TCalendarResults {
    total: number;
    finished: number;
    current: number;
    upcoming: number;
    recurrent: number;
}

// Type for the `calendar` object
export interface TCalendar {
    results: TCalendarResults;
}

// Type for the `data` object
export interface TCalendarData {
    calendar: TCalendar;
}

// Type for the root API response
export interface TCalendarChartApiResponse {
    success: boolean;
    data: TCalendarData;
}

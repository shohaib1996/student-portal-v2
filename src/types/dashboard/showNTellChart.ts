// Type for the `results` object
export interface TShowNTellChartResults {
    acceptedItems: number;
    pendingItems: number;
    rejectedItems: number;
    totalItems: number;
    //   recurrent: number;
}

// Type for the `calendar` object
export interface TShowNTellChart {
    results: TShowNTellChartResults;
}

// Type for the `data` object
export interface TShowNTellChartData {
    showTell: TShowNTellChart;
}

// Type for the root API response
export interface TShowNTellChartApiResponse {
    success: boolean;
    results: TShowNTellChartResults;
}

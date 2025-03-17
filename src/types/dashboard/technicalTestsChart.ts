// Type for the `results` object
export interface TTechnicalTestsResults {
    acceptedItems: number;
    pendingItems: number;
    rejectedItems: number;
    totalItems: number;
    //   recurrent: number;
}

// Type for the `calendar` object
export interface TTechnicalTests {
    results: TTechnicalTestsResults;
}

// Type for the `data` object
export interface TTechnicalTestsData {
    assignment: TTechnicalTests;
}

// Type for the root API response
export interface TTechnicalTestsApiResponse {
    success: boolean;
    results: TTechnicalTestsResults;
}

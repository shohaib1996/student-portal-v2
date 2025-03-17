export interface TProgressChartMetrics {
    totalMark: number; // Total possible marks
    totalObtainedMark: number; // Marks obtained so far
    overallPercentageAllItems: number; // Percentage across all items
}

export interface TProgressChartAdditionalData {
    totalItems?: number; // Total items for this category
    acceptedItems?: number; // Accepted items for this category
    pendingItems?: number; // Pending items for this category
    rejectedItems?: number; // Rejected items for this category
    totalMessage?: number; // Total messages
    totalChat?: number; // Total chat threads
    totalUnreadChat?: number; // Total unread chat threads
    totalReadChat?: number; // Total read chat threads
    totalPinnedMessages?: number; // Total pinned messages
    totalUnreadCrowd?: number; // Total unread crowd messages
    totalUnreadDirect?: number; // Total unread direct messages
    uploadedDocument?: number; // Total uploaded documents
    total?: number; // Generic total
    finished?: number; // Finished items
    current?: number; // Current items
    upcoming?: number; // Upcoming items
    recurrent?: number; // Recurrent items
}

export interface TProgressChartResult {
    _id: string; // Unique identifier for the result
    id: string; // Identifier string for the result interface
    title: string; // Title for the result
    limit: number; // Limit for the result count
    count: number; // Current count for the result
    additionalData: TProgressChartAdditionalData; // Additional metadata for the result
}

export interface TProgressChart {
    success: boolean; // Status of the API response
    metrics: TProgressChartMetrics; // Overall metrics
    results: TProgressChartResult[]; // List of individual results
    _id: string; // Unique identifier for the dashboard response
    enrollment: string; // Associated enrollment ID
    user: string; // Associated user ID
    createdAt: string; // Creation timestamp
    updatedAt: string; // Update timestamp
    __v: number; // Version number
}

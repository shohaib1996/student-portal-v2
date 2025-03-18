export interface TMessages {
    totalMessage: number;
    totalChat: number;
    totalUnreadChat: number;
    totalReadChat: number;
    totalPinnedMessages: number;
    totalUnreadCrowd: number;
    totalUnreadDirect: number;
}

export interface TMessagesRes {
    success: boolean;
    results: TMessages;
}

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from 'sonner';

// Define the shape of each chat modal
interface ChatModal {
    id: string;
    type: 'list' | 'conversation';
    position: number; // Position from right to left (0 = rightmost)
    chatId?: string;
    minimized: boolean;
}

// Define the state shape
interface ChatModalsState {
    isListOpen: boolean;
    openModals: ChatModal[];
    maxChatLimitReached: boolean;
    maxTotalLimitReached: boolean;
}

// Define action types
type ChatModalsAction =
    | { type: 'OPEN_LIST_MODAL' }
    | { type: 'CLOSE_LIST_MODAL' }
    | { type: 'OPEN_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'CLOSE_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'MINIMIZE_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'RESTORE_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'CLOSE_ALL_MODALS' }
    | { type: 'RESET_MAX_LIMIT_WARNING' }
    | { type: 'RESET_TOTAL_LIMIT_WARNING' };

// Context type
interface ChatModalsContextType {
    isListOpen: boolean;
    openModals: ChatModal[];
    maxChatLimitReached?: boolean;
    maxTotalLimitReached: boolean;
    openListModal: () => void;
    closeListModal: () => void;
    openChatModal: (chatId: string) => void;
    closeChatModal: (chatId: string) => void;
    minimizeChatModal: (chatId: string) => void;
    restoreChatModal: (chatId: string) => void;
    closeAllModals: () => void;
    isModalOpen: (chatId: string) => boolean;
    isModalMinimized: (chatId: string) => boolean;
    resetMaxLimitWarning: () => void;
    resetTotalLimitWarning: () => void;
}

// Create context
const ChatModalsContext = createContext<ChatModalsContextType | undefined>(
    undefined,
);

// Initial state
const initialState: ChatModalsState = {
    isListOpen: false,
    openModals: [],
    maxChatLimitReached: false,
    maxTotalLimitReached: false,
};

// Reducer function
function chatModalsReducer(
    state: ChatModalsState,
    action: ChatModalsAction,
): ChatModalsState {
    switch (action.type) {
        case 'OPEN_LIST_MODAL':
            // Chat list always has position 0 (rightmost)
            return {
                ...state,
                isListOpen: true,
                openModals: state.openModals.find(
                    (modal) => modal.type === 'list',
                )
                    ? state.openModals
                    : [
                          {
                              id: 'chat-list',
                              type: 'list',
                              position: 0,
                              minimized: false,
                          },
                          ...state.openModals.map((modal) => ({
                              ...modal,
                              // Increase position for all other modals to shift them left
                              position: modal.position + 1,
                          })),
                      ],
            };

        case 'CLOSE_LIST_MODAL':
            return {
                ...state,
                isListOpen: false,
                openModals: state.openModals
                    .filter((modal) => modal.type !== 'list')
                    .map((modal, index) => ({
                        ...modal,
                        position: index,
                    })),
            };

        // Update the OPEN_CHAT_MODAL case to count only non-minimized conversation modals
        case 'OPEN_CHAT_MODAL': {
            // Check if this chat is already open
            const existingModal = state.openModals.find(
                (modal) =>
                    modal.type === 'conversation' &&
                    modal.chatId === action.payload.chatId,
            );

            if (existingModal) {
                // If already open and minimized, just restore it
                if (existingModal.minimized) {
                    // Check if we already have max visible modals (list + 3 conversations)
                    const visibleModals = state.openModals.filter(
                        (modal) => !modal.minimized,
                    );

                    if (visibleModals.length >= 4) {
                        // Don't auto-minimize, just set the flag
                        return {
                            ...state,
                            maxChatLimitReached: true,
                        };
                    } else {
                        // Just restore the minimized modal
                        return {
                            ...state,
                            openModals: state.openModals.map((modal) =>
                                modal.id === existingModal.id
                                    ? { ...modal, minimized: false }
                                    : modal,
                            ),
                        };
                    }
                }

                // If already open and not minimized, no change needed
                return state;
            }

            // Count all conversation modals (including minimized) for the total limit
            const totalChatModals = state.openModals.filter(
                (modal) => modal.type === 'conversation',
            ).length;

            if (totalChatModals >= 9) {
                // 9 conversations + 1 list = 10 total
                return {
                    ...state,
                    maxTotalLimitReached: true,
                };
            }

            // Count visible conversation modals (not minimized)
            const visibleChatModals = state.openModals.filter(
                (modal) => modal.type === 'conversation' && !modal.minimized,
            ).length;

            // If already at maximum visible chats (excluding list modal), show a toast warning
            if (visibleChatModals >= 3) {
                // 3 conversation modals + 1 list modal = 4 total
                return {
                    ...state,
                    maxChatLimitReached: true,
                    maxTotalLimitReached: false,
                };
            }

            // Make sure the list modal is at position 0
            let newModals = [...state.openModals];
            const hasListModal = newModals.some(
                (modal) => modal.type === 'list',
            );
            // If no list modal, create one
            if (!hasListModal) {
                newModals.push({
                    id: 'chat-list',
                    type: 'list',
                    position: 0,
                    minimized: false,
                });
            }

            // Find the first available position for visible modals
            let availablePosition = 1;
            const usedVisiblePositions = new Set(
                newModals
                    .filter((modal) => !modal.minimized)
                    .map((modal) => modal.position),
            );

            // Find the first available position
            while (usedVisiblePositions.has(availablePosition)) {
                availablePosition++;
            }

            // Add the new conversation modal
            newModals.push({
                id: `chat-${action.payload.chatId}`,
                type: 'conversation' as const,
                position: availablePosition,
                chatId: action.payload.chatId,
                minimized: false,
            });

            // Ensure list modal is at position 0
            newModals = newModals.map((modal) =>
                modal.type === 'list' ? { ...modal, position: 0 } : modal,
            );

            // Sort modals by position for consistent ordering
            newModals.sort((a, b) => a.position - b.position);

            return {
                ...state,
                isListOpen: true,
                openModals: newModals,
                maxChatLimitReached: false,
            };
        }

        // Update the CLOSE_CHAT_MODAL case to properly reposition remaining modals
        case 'CLOSE_CHAT_MODAL': {
            // Find the modal we're closing
            const targetModal = state.openModals.find(
                (modal) =>
                    modal.type === 'conversation' &&
                    modal.chatId === action.payload.chatId,
            );

            if (!targetModal || targetModal.minimized) {
                // If modal is already minimized or doesn't exist, just remove it without repositioning
                const updatedModals = state.openModals.filter(
                    (modal) =>
                        !(
                            modal.type === 'conversation' &&
                            modal.chatId === action.payload.chatId
                        ),
                );

                return {
                    ...state,
                    openModals: updatedModals,
                };
            }

            // Get the position of the modal being closed
            const positionBeingFreed = targetModal.position;

            // Remove the closed modal
            const filteredModals = state.openModals.filter(
                (modal) =>
                    !(
                        modal.type === 'conversation' &&
                        modal.chatId === action.payload.chatId
                    ),
            );

            // Shift all other visible modals with higher positions to the left
            const repositionedModals = filteredModals.map((modal) => {
                // Only reposition visible modals
                if (!modal.minimized && modal.position > positionBeingFreed) {
                    return { ...modal, position: modal.position - 1 };
                }
                return modal;
            });

            return {
                ...state,
                openModals: repositionedModals,
            };
        }

        // Update the MINIMIZE_CHAT_MODAL case to reposition the remaining modals
        case 'MINIMIZE_CHAT_MODAL': {
            // First find the modal we're minimizing
            const targetModal = state.openModals.find(
                (modal) =>
                    modal.type === 'conversation' &&
                    modal.chatId === action.payload.chatId,
            );

            if (!targetModal) {
                return state;
            }

            // Get the position of the modal being minimized
            const positionBeingFreed = targetModal.position;

            // Minimize the target modal
            const updatedModals = state.openModals.map((modal) =>
                modal.type === 'conversation' &&
                modal.chatId === action.payload.chatId
                    ? { ...modal, minimized: true }
                    : modal,
            );

            // Shift all other visible modals with higher positions to the left
            const repositionedModals = updatedModals.map((modal) => {
                // Only reposition visible modals
                if (!modal.minimized && modal.position > positionBeingFreed) {
                    return { ...modal, position: modal.position - 1 };
                }
                return modal;
            });

            return {
                ...state,
                openModals: repositionedModals,
            };
        }
        // Also add the missing reducer case
        case 'RESET_TOTAL_LIMIT_WARNING':
            return {
                ...state,
                maxTotalLimitReached: false,
            };
        case 'RESTORE_CHAT_MODAL': {
            // Check if this chat is already open and not minimized (unlikely but safety check)
            const existingModal = state.openModals.find(
                (modal) =>
                    modal.type === 'conversation' &&
                    modal.chatId === action.payload.chatId &&
                    !modal.minimized,
            );

            // If already visible, no change needed
            if (existingModal) {
                return state;
            }

            // Count visible modals (not minimized)
            const visibleModals = state.openModals.filter(
                (modal) => !modal.minimized,
            );

            let newModals = [...state.openModals];

            // If we already have max visible modals (4 including list)
            if (visibleModals.length >= 4) {
                // Find the rightmost visible conversation modal
                const conversationModals = visibleModals
                    .filter((modal) => modal.type === 'conversation')
                    .sort((a, b) => b.position - a.position); // Sort by position in descending order

                if (conversationModals.length > 0) {
                    const rightmostModal = conversationModals[0];

                    // Auto-minimize the rightmost conversation modal
                    newModals = newModals.map((modal) =>
                        modal.id === rightmostModal.id
                            ? { ...modal, minimized: true }
                            : modal,
                    );
                } else {
                    // Safety check - shouldn't happen but if there are no conversation modals
                    return {
                        ...state,
                        maxChatLimitReached: true,
                    };
                }
            }

            // Find the modal we want to restore
            const modalToRestore = newModals.find(
                (modal) =>
                    modal.type === 'conversation' &&
                    modal.chatId === action.payload.chatId,
            );

            if (!modalToRestore) {
                return state;
            }

            // Find the first available position for visible modals
            let availablePosition = 1;
            const usedVisiblePositions = new Set(
                newModals
                    .filter((modal) => !modal.minimized)
                    .map((modal) => modal.position),
            );

            // Find the first available position
            while (usedVisiblePositions.has(availablePosition)) {
                availablePosition++;
            }

            // Update the modals array - restore the minimized modal with the new position
            newModals = newModals.map((modal) =>
                modal.id === modalToRestore.id
                    ? {
                          ...modal,
                          minimized: false,
                          position: availablePosition,
                      }
                    : modal,
            );

            // Sort modals by position for consistent ordering
            newModals.sort((a, b) => a.position - b.position);

            return {
                ...state,
                openModals: newModals,
                maxChatLimitReached: false,
            };
        }

        case 'CLOSE_ALL_MODALS':
            return {
                ...state,
                isListOpen: false,
                openModals: [],
            };
        case 'RESET_MAX_LIMIT_WARNING':
            return {
                ...state,
                maxChatLimitReached: false,
            };

        default:
            return state;
    }
}

// Provider component
export function ChatModalsProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(chatModalsReducer, initialState);

    const openListModal = () => {
        dispatch({ type: 'OPEN_LIST_MODAL' });
    };

    const closeListModal = () => {
        dispatch({ type: 'CLOSE_LIST_MODAL' });
    };

    const openChatModal = (chatId: string) => {
        dispatch({ type: 'OPEN_CHAT_MODAL', payload: { chatId } });
    };

    const closeChatModal = (chatId: string) => {
        dispatch({ type: 'CLOSE_CHAT_MODAL', payload: { chatId } });
    };

    const closeAllModals = () => {
        dispatch({ type: 'CLOSE_ALL_MODALS' });
    };
    const resetMaxLimitWarning = () => {
        dispatch({ type: 'RESET_MAX_LIMIT_WARNING' });
    };

    const minimizeChatModal = (chatId: string) => {
        dispatch({ type: 'MINIMIZE_CHAT_MODAL', payload: { chatId } });
    };

    const restoreChatModal = (chatId: string) => {
        dispatch({ type: 'RESTORE_CHAT_MODAL', payload: { chatId } });
    };

    const isModalOpen = (chatId: string) => {
        return state.openModals.some(
            (modal) => modal.type === 'conversation' && modal.chatId === chatId,
        );
    };
    // Add this function to the ChatModalsProvider component
    const resetTotalLimitWarning = () => {
        dispatch({ type: 'RESET_TOTAL_LIMIT_WARNING' });
    };

    const isModalMinimized = (chatId: string) => {
        const modal = state.openModals.find(
            (modal) => modal.type === 'conversation' && modal.chatId === chatId,
        );
        return modal ? modal.minimized : false;
    };

    return (
        <ChatModalsContext.Provider
            value={{
                isListOpen: state.isListOpen,
                openModals: state.openModals,
                maxChatLimitReached: state.maxChatLimitReached,
                maxTotalLimitReached: state.maxTotalLimitReached,
                openListModal,
                closeListModal,
                openChatModal,
                closeChatModal,
                minimizeChatModal,
                restoreChatModal,
                closeAllModals,
                isModalOpen,
                isModalMinimized,
                resetMaxLimitWarning,
                resetTotalLimitWarning,
            }}
        >
            {children}
        </ChatModalsContext.Provider>
    );
}

// Custom hook to use the context
export function useChatModals() {
    const context = useContext(ChatModalsContext);
    if (context === undefined) {
        throw new Error(
            'useChatModals must be used within a ChatModalsProvider',
        );
    }
    return context;
}

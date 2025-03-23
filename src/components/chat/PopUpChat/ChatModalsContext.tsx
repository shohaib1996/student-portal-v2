'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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
}

// Define action types
type ChatModalsAction =
    | { type: 'OPEN_LIST_MODAL' }
    | { type: 'CLOSE_LIST_MODAL' }
    | { type: 'OPEN_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'CLOSE_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'MINIMIZE_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'RESTORE_CHAT_MODAL'; payload: { chatId: string } }
    | { type: 'CLOSE_ALL_MODALS' };

// Context type
interface ChatModalsContextType {
    isListOpen: boolean;
    openModals: ChatModal[];
    openListModal: () => void;
    closeListModal: () => void;
    openChatModal: (chatId: string) => void;
    closeChatModal: (chatId: string) => void;
    minimizeChatModal: (chatId: string) => void;
    restoreChatModal: (chatId: string) => void;
    closeAllModals: () => void;
    isModalOpen: (chatId: string) => boolean;
    isModalMinimized: (chatId: string) => boolean;
}

// Create context
const ChatModalsContext = createContext<ChatModalsContextType | undefined>(
    undefined,
);

// Initial state
const initialState: ChatModalsState = {
    isListOpen: false,
    openModals: [],
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
                    return {
                        ...state,
                        openModals: state.openModals.map((modal) =>
                            modal.id === existingModal.id
                                ? { ...modal, minimized: false }
                                : modal,
                        ),
                    };
                }

                // If already open and not minimized, no change needed
                return state;
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

            // Find the highest position number for conversation modals
            const maxPosition = Math.max(
                0,
                ...newModals
                    .filter((modal) => modal.type === 'conversation')
                    .map((modal) => modal.position),
            );

            // Add the new conversation modal at position maxPosition + 1
            newModals.push({
                id: `chat-${action.payload.chatId}`,
                type: 'conversation' as const,
                position: maxPosition + 1,
                chatId: action.payload.chatId,
                minimized: false,
            });

            // If we have more than 4 modals total, remove the oldest conversation
            const conversationModals = newModals.filter(
                (modal) => modal.type === 'conversation' && !modal.minimized,
            );

            if (conversationModals.length > 3) {
                // 3 + list = 4 total
                // Find the oldest conversation (highest position number)
                const oldestConversation = [...conversationModals].sort(
                    (a, b) => b.position - a.position,
                )[0];

                // Remove it
                newModals = newModals.filter(
                    (modal) => modal.id !== oldestConversation.id,
                );
            }

            // Ensure list modal is at position 0, and sort everything else
            newModals = newModals.map((modal) =>
                modal.type === 'list' ? { ...modal, position: 0 } : modal,
            );

            // Sort modals by position
            newModals.sort((a, b) => a.position - b.position);

            return {
                ...state,
                isListOpen: true,
                openModals: newModals,
            };
        }

        case 'CLOSE_CHAT_MODAL': {
            // Filter out the closed modal and reorder positions
            const updatedModals = state.openModals
                .filter(
                    (modal) =>
                        !(
                            modal.type === 'conversation' &&
                            modal.chatId === action.payload.chatId
                        ),
                )
                .map((modal, index) => ({
                    ...modal,
                    position: modal.type === 'list' ? 0 : index,
                }));

            return {
                ...state,
                openModals: updatedModals,
            };
        }

        case 'MINIMIZE_CHAT_MODAL': {
            return {
                ...state,
                openModals: state.openModals.map((modal) =>
                    modal.type === 'conversation' &&
                    modal.chatId === action.payload.chatId
                        ? { ...modal, minimized: true }
                        : modal,
                ),
            };
        }

        case 'RESTORE_CHAT_MODAL': {
            return {
                ...state,
                openModals: state.openModals.map((modal) =>
                    modal.type === 'conversation' &&
                    modal.chatId === action.payload.chatId
                        ? { ...modal, minimized: false }
                        : modal,
                ),
            };
        }

        case 'CLOSE_ALL_MODALS':
            return {
                ...state,
                isListOpen: false,
                openModals: [],
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
                openListModal,
                closeListModal,
                openChatModal,
                closeChatModal,
                minimizeChatModal,
                restoreChatModal,
                closeAllModals,
                isModalOpen,
                isModalMinimized,
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

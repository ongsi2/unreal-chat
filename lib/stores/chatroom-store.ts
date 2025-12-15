import { create } from "zustand";
import { ChatRoom, ChatRoomWithDetails } from "@/lib/types";

interface ChatRoomState {
  chatRooms: ChatRoomWithDetails[];
  currentChatRoom: ChatRoomWithDetails | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setChatRooms: (chatRooms: ChatRoomWithDetails[]) => void;
  setCurrentChatRoom: (chatRoom: ChatRoomWithDetails | null) => void;
  addChatRoom: (chatRoom: ChatRoomWithDetails) => void;
  updateChatRoom: (id: string, updates: Partial<ChatRoom>) => void;
  removeChatRoom: (id: string) => void;
  incrementUnreadCount: (roomId: string) => void;
  resetUnreadCount: (roomId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatRoomStore = create<ChatRoomState>((set) => ({
  chatRooms: [],
  currentChatRoom: null,
  isLoading: false,
  error: null,

  setChatRooms: (chatRooms) => set({ chatRooms }),

  setCurrentChatRoom: (chatRoom) => set({ currentChatRoom: chatRoom }),

  addChatRoom: (chatRoom) =>
    set((state) => ({
      chatRooms: [chatRoom, ...state.chatRooms],
    })),

  updateChatRoom: (id, updates) =>
    set((state) => ({
      chatRooms: state.chatRooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
      currentChatRoom:
        state.currentChatRoom?.id === id
          ? { ...state.currentChatRoom, ...updates }
          : state.currentChatRoom,
    })),

  removeChatRoom: (id) =>
    set((state) => ({
      chatRooms: state.chatRooms.filter((room) => room.id !== id),
      currentChatRoom:
        state.currentChatRoom?.id === id ? null : state.currentChatRoom,
    })),

  incrementUnreadCount: (roomId) =>
    set((state) => {
      const now = new Date();
      const updatedRooms = state.chatRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              unreadCount: (room.unreadCount || 0) + 1,
              lastMessageAt: now  // 새 메시지 시간 업데이트
            }
          : room
      );

      // lastMessageAt 기준으로 정렬 (최신 메시지가 위로)
      updatedRooms.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });

      return { chatRooms: updatedRooms };
    }),

  resetUnreadCount: (roomId) =>
    set((state) => ({
      chatRooms: state.chatRooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));

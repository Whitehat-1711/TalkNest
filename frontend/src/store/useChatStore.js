import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { AI_ASSISTANT_USER } from "../constants";

const ASSISTANT_ID = AI_ASSISTANT_USER._id;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  unreadCounts: {},
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: [AI_ASSISTANT_USER, ...res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const endpoint = userId === ASSISTANT_ID ? "/assistant/history" : `/messages/${userId}`;
      const res = await axiosInstance.get(endpoint);
      set((state) => ({
        messages: res.data,
        unreadCounts: {
          ...state.unreadCounts,
          [userId]: 0,
        },
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      if (selectedUser._id === ASSISTANT_ID) {
        const text = messageData?.text?.trim();
        if (!text) {
          toast.error("Please type a message for the assistant");
          return;
        }

        const res = await axiosInstance.post("/assistant/chat", { message: text });
        set({ messages: [...messages, res.data.userMessage, res.data.assistantMessage] });
        return;
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send message";
      toast.error(errorMessage);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages } = get();
      if (!selectedUser || selectedUser._id === ASSISTANT_ID) return;

      const isMessageFromOpenChat = selectedUser && newMessage.senderId === selectedUser._id;

      if (isMessageFromOpenChat) {
        set({
          messages: [...messages, newMessage],
        });
        return;
      }

      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1,
        },
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    if (!selectedUser) {
      set({ selectedUser: null });
      return;
    }

    set((state) => ({
      selectedUser,
      unreadCounts: {
        ...state.unreadCounts,
        [selectedUser._id]: 0,
      },
    }));
  },
}));

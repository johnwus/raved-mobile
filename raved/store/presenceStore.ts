import { create } from 'zustand';

interface OnlineUser {
  userId: string;
  username: string;
  timestamp: Date;
}

interface PresenceState {
  onlineUsers: Map<string, OnlineUser>;
  setUserOnline: (userId: string, username: string) => void;
  setUserOffline: (userId: string) => void;
  isUserOnline: (userId: string) => boolean;
  getOnlineUser: (userId: string) => OnlineUser | undefined;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Map(),
  
  setUserOnline: (userId: string, username: string) => {
    set((state) => {
      const newMap = new Map(state.onlineUsers);
      newMap.set(userId, {
        userId,
        username,
        timestamp: new Date()
      });
      console.log(`[PresenceStore] Added ${username} (${userId}) to online users. Total: ${newMap.size}`);
      return { onlineUsers: newMap };
    });
  },
  
  setUserOffline: (userId: string) => {
    set((state) => {
      const newMap = new Map(state.onlineUsers);
      const user = newMap.get(userId);
      newMap.delete(userId);
      console.log(`[PresenceStore] Removed ${user?.username} (${userId}) from online users. Total: ${newMap.size}`);
      return { onlineUsers: newMap };
    });
  },
  
  isUserOnline: (userId: string) => {
    const { onlineUsers } = get();
    const isOnline = onlineUsers.has(userId);
    // Uncomment for verbose logging:
    // console.log(`[PresenceStore] isUserOnline(${userId}): ${isOnline}`);
    return isOnline;
  },
  
  getOnlineUser: (userId: string) => {
    const { onlineUsers } = get();
    return onlineUsers.get(userId);
  }
}));

// stores/userStore.ts
import { defineStore } from "pinia";
import * as api from "../apiClient";

export interface User {
  userId: string;
  name: string;
  email: string;
}

interface UserStoreState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

// ✅ ADD THIS — missing actions interface
interface UserStoreActions {
  syncCurrentUser(userId: string): Promise<User>;
  fetchUser(userId: string): Promise<User>;
  signup(name: string, email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): void;
  restoreSession(): Promise<boolean>;
  updateUser(
    userId: string,
    name: string,
    email: string,
    password?: string,
  ): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

// ✅ This now works because actions interface is defined
export const useUserStore = defineStore<
  "userStore",
  UserStoreState,
  {},
  UserStoreActions
>("userStore", {
  state: (): UserStoreState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
  }),

  actions: {
    async syncCurrentUser(userId: string): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.getUser(userId);
        if (res.error) throw new Error(res.error);

        const userData = {
          userId: res.user.userId,
          name: res.user.name,
          email: res.user.email,
        };

        const index = this.users.findIndex((u) => u.userId === userId);
        if (index !== -1) this.users[index] = userData;
        else this.users.push(userData);

        if (!this.currentUser || this.currentUser.userId === userId) {
          this.currentUser = userData;
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        }

        return userData;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(userId: string) {
      return await this.syncCurrentUser(userId);
    },

    async signup(name: string, email: string, password: string) {
      const res = await api.addUser(name, email, password);
      if (res.error) throw new Error(res.error);

      const user: User = { userId: res.user.userId, name, email };
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));

      return user;
    },

    async login(email: string, password: string): Promise<User> {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.loginUser(email, password);
        if (res.error) throw new Error(res.error);

        const user = {
          userId: res.user.userId,
          name: res.user.name,
          email: res.user.email,
        };

        this.currentUser = user;
        
        await this.fetchUser(user.userId);
        return user;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem("currentUser");
    },

    async restoreSession(): Promise<boolean> {
      const saved = localStorage.getItem("currentUser");
      if (!saved) return false;

      try {
        const parsed = JSON.parse(saved);
        if (parsed?.userId) {
          await this.syncCurrentUser(parsed.userId);
          return true;
        }
      } catch {}

      this.currentUser = null;
      localStorage.removeItem("currentUser");
      return false;
    },

    async updateUser(
      userId: string,
      name: string,
      email: string,
      password?: string,
    ) {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.updateUser(userId, name, email, password);
        if (res.error) throw new Error(res.error);

        const updatedUser = { userId, name, email };
        const index = this.users.findIndex((u) => u.userId === userId);
        if (index !== -1) this.users[index] = updatedUser;

        if (this.currentUser?.userId === userId) {
          this.currentUser = updatedUser;
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const res = await api.deleteUser(userId);
        if (res.error) throw new Error(res.error);

        this.users = this.users.filter((u) => u.userId !== userId);
        if (this.currentUser?.userId === userId) this.logout();
      } finally {
        this.loading = false;
      }
    },
  },
});

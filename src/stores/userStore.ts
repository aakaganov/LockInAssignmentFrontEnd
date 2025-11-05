// stores/userStore.ts
import { defineStore } from "pinia";
import * as api from "../apiClient";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [] as { userId: string; name: string; email: string }[],
    currentUser: null as { userId: string; name: string; email: string } | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    /** Fetch user info from API by email */
    async fetchUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.getUser(userId);
        if (res.error) throw new Error(res.error);

        const userData = { userId, name: res.name, email: res.email };
        const index = this.users.findIndex(u => u.userId === userId);
        if (index !== -1) this.users[index] = userData;
        else this.users.push(userData);

        // Update currentUser if it matches
        if (this.currentUser?.userId === userId) {
          this.currentUser = userData;
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        }
        return userData; // ✅ return user for consistency
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    /** Signup a new user */
    async signup(name: string, email: string, password: string) {
      const res = await api.addUser(name, email, password);
      if (res.error) throw new Error(res.error);

      const user = { userId: res.user.userId, name: res.user.name, email: res.user.email };
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user; // ✅ return user
    },

    /** Login existing user */
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.loginUser(email, password);
        if (res.error) throw new Error(res.error);

        const user = { userId: res.user.userId, name: res.user.name, email: res.user.email };
        this.currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Fetch full info to sync
        await this.fetchUser(user.userId);
        return user; // ✅ return user
      } catch (err: any) {
        this.currentUser = null;
        localStorage.removeItem("currentUser");
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /** Logout user */
    logout() {
      this.currentUser = null;
      localStorage.removeItem("currentUser");
    },

    /** Restore session from localStorage */
    async restoreSession() {
      const saved = localStorage.getItem("currentUser");
      if (!saved) return false;

      try {
        const parsed = JSON.parse(saved);
        if (parsed?.userId) {
          const res = await api.getUser(parsed.userId);
          if (!res.error) {
            this.currentUser = { userId: parsed.userId, name: res.name, email: res.email };
            localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
            return true;
          }
        }

        this.currentUser = null;
        localStorage.removeItem("currentUser");
        return false;
      } catch {
        this.currentUser = null;
        localStorage.removeItem("currentUser");
        return false;
      }
    },

    /** Update user info */
    async updateUser(userId: string, name: string, email: string, password?: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.updateUser(userId, name, email, password);
        if (res.error) throw new Error(res.error);

        const updatedUser = { userId: email, name, email };
        const index = this.users.findIndex(u => u.userId === userId);
        if (index !== -1) this.users[index] = updatedUser;

        if (this.currentUser?.userId === userId) {
          this.currentUser = updatedUser;
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        }
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /** Delete user */
    async deleteUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.deleteUser(userId);
        if (res.error) throw new Error(res.error);

        this.users = this.users.filter(u => u.userId !== userId);
        if (this.currentUser?.userId === userId) this.logout();
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});

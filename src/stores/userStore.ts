import { defineStore } from "pinia";
import * as api from "../apiClient";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    users: [] as { userId: string; name: string; email: string }[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // Fetch a single user by ID and store it in users array
    async fetchUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.getUser(userId);
        if (res.error) throw new Error(res.error);

        // Check if user already exists in state
        const index = this.users.findIndex(u => u.userId === userId);
        if (index !== -1) {
          this.users[index] = { userId, ...res };
        } else {
          this.users.push({ userId, ...res });
        }
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // Add a new user and then fetch to update state
    async addUser(userId: string, name: string, email: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.addUser(userId, name, email);
        if (res.error) throw new Error(res.error);

        await this.fetchUser(userId);
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // Delete a user and remove them from state
    async deleteUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.deleteUser(userId);
        if (res.error) throw new Error(res.error);

        this.users = this.users.filter(u => u.userId !== userId);
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
});

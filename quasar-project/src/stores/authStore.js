import { defineStore } from 'pinia';
import { api } from 'boot/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    getUser: (state) => state.user,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error,
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    // Set the token
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
      // console.log(token)
    },

    // Clear the token
    clearToken() {
      this.token = null;
      localStorage.removeItem('token');
    },

    setUser(user) {
      this.user = user;
    },

    clearUser() {
      this.user = null;
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/users/login', { email, password });
        this.setToken(response.data.token);
        // await this.fetchUserWithInfo();
        return true;
      } catch (error) {
        if (error.response?.status === 401) {
      this.error = "Identifiant ou mot de passe incorrect";
        } else {
          this.error = error.response?.data?.message || error.message;
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // async fetchUserWithInfo() {
    //     if (!this.token) return;
    //     try {
    //     const response = await api.get('/auth/user-info', {
    //         headers: { Authorization: `Bearer ${this.token}` },
    //     });
    //     this.setUser(response.data);
    //     } catch (error) {
    //     this.error = error.message;
    //     throw error;
    //     }
    // },

    logout() {
        this.clearToken();
        this.clearUser();
    },

    async register(email, password) {
      this.loading = true;
      this.error = null;
      try {
        await api.post('/users/register', { email, password });
        return true;
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});

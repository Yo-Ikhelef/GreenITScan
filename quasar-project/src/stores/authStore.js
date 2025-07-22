import { defineStore } from 'pinia';
import { api } from 'boot/axios';
// import { useNotificationsStore } from './notificationsStore.js';

// System columns that are always visible
const systemColumns = ['actions'];

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    tokenExpiration: localStorage.getItem('tokenExpiration') || null,
    users: [],
    userId: null,
    roles: [],
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    workplace: '',
    tel: '',
    loading: false,
    error: null,
    userPagination: {
      sortBy: 'id',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      search: '',
    },
    visibleColumns: [], // Visible columns in the table
    defaultColumns: [], // Default columns in the table
  }),

  getters: {
    getUsers: (state) => state.users,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error,
    isAuthenticated: (state) =>
      state.token && state.tokenExpiration
        ? new Date(state.tokenExpiration) > new Date()
        : false,
    isTokenExpired: (state) => {
      if (!state.token || !state.tokenExpiration) return true;
      return new Date(state.tokenExpiration) < new Date();
    },
    getUserId: (state) => state.userId,
    getRoles: (state) => state.roles,
    getFirstName: (state) => state.firstName,
    getLastName: (state) => state.lastName,
    getEmail: (state) => state.email,
    getPosition: (state) => state.position,
    getWorkplace: (state) => state.workplace,
    getTel: (state) => state.tel,
  },

  actions: {
    setUserPaginationPage(page) {
      this.userPagination.page = page;
    },
    setUserPaginationRowsPerPage(rowsPerPage) {
      this.userPagination.rowsPerPage = rowsPerPage;
    },
    setUserPaginationRowsNumber(rowsNumber) {
      this.userPagination.rowsNumber = rowsNumber;
    },

    // Initialize visible columns based on default columns
    initializeVisibleColumns(columns) {
      const defaultCols = columns
        .filter((col) => !systemColumns.includes(col.name))
        .map((col) => col.name);
      this.defaultColumns = [...defaultCols];
      if (this.visibleColumns.length === 0) {
        this.visibleColumns = [...defaultCols];
      }
    },

    // Toggle visibility of a column
    toggleColumnVisibility(columnName) {
      if (systemColumns.includes(columnName)) return;
      if (this.visibleColumns.includes(columnName)) {
        if (this.visibleColumns.length > 1) {
          this.visibleColumns = this.visibleColumns.filter((col) => col !== columnName);
        }
      } else {
        this.visibleColumns.push(columnName);
      }
    },

    // Reset visible columns to default columns
    resetVisibleColumns() {
      this.visibleColumns = [...this.defaultColumns];
    },

    // Set the token and its expiration date
    setToken(token, expirationDate) {
      const expirationDateFormatted = new Date(expirationDate);
      this.token = token;
      this.tokenExpiration = expirationDateFormatted;
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiration', expirationDateFormatted.toISOString());
    },

    // Clear the token and its expiration date
    clearToken() {
      this.token = null;
      this.tokenExpiration = null;
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
    },

    // USER PART

    async fetchUserWithInfo() {
      if (!this.token) return;

      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/auth/user-info', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.setUser(response.data);
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'User info fetched successfully.',
        //   type: 'positive',
        //   position: 'top-right',
        // });
      } catch (error) {
        this.error = error.message;
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'Error fetching user info.',
        //   type: 'negative',
        //   position: 'top-right',
        // });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setUser(userData) {
      const userInfo = userData.user_info || {};
      this.userId = userData.id || null;
      this.roles = userData.roles || [];
      this.firstName = userInfo.firstname || '';
      this.role = userInfo.role;
      this.lastName = userInfo.lastname || '';
      this.email = userData.email || '';
      this.position = userInfo.position || '';
      this.workplace = userInfo.workplace || '';
      this.tel = userInfo.tel || '';
    },

    clearUser() {
      this.userId = null;
      this.roles = [];
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.position = '';
      this.workplace = '';
      this.tel = '';
    },

    // ADMIN PART

    async updateUserInfo(updatedData) {
      this.loading = true;
      this.error = null;
      try {
        const userId = this.getUserId;
        const payload = {
          id: userId,
          email: updatedData.email,
          password: updatedData.password || undefined,
          user_id: userId,
          firstname: updatedData.firstname,
          lastname: updatedData.lastname,
          tel: updatedData.tel,
          position: updatedData.position,
          workplace: updatedData.workplace,
        };
        const response = await api.put(`/users/${userId}`, payload, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.setUser(response.data);
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'User information updated successfully.',
        //   type: 'positive',
        //   position: 'top-right',
        // });
      } catch (error) {
        this.error = error.message;
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'Error updating user information.',
        //   type: 'negative',
        //   position: 'top-right',
        // });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async editUser(userData, userId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put(`/users/${userId}/edit`, userData, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'User edited successfully.',
        //   type: 'positive',
        //   position: 'top-right',
        // });
        return response.data;
      } catch (error) {
        this.error = error.message;
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'Error editing user.',
        //   type: 'negative',
        //   position: 'top-right',
        // });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createUser(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/users/create', userData, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'User created successfully.',
        //   type: 'positive',
        //   position: 'top-right',
        // });
        return response.data;
      } catch (error) {
        this.error = error.message;
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'Error creating user.',
        //   type: 'negative',
        //   position: 'top-right',
        // });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deactivateUser(userId) {
      this.loading = true;
      this.error = null;
      try {
        await api.put(`/users/${userId}/deactivate`, {}, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.users = this.users.filter((user) => user.id !== userId);
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'User deactivated successfully.',
        //   type: 'positive',
        //   position: 'top-right',
        // });
      } catch (error) {
        this.error = error.message;
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'Error deactivating user.',
        //   type: 'negative',
        //   position: 'top-right',
        // });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const { page, rowsPerPage, sortBy, descending, search } = this.userPagination;
        const response = await api.get('/users', {
          params: { page, rowsPerPage, sortBy, descending, search },
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.users = response.data.data;
        this.setUserPaginationPage(response.data.current_page);
        this.setUserPaginationRowsPerPage(response.data.per_page);
        this.setUserPaginationRowsNumber(response.data.total);
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'Users fetched successfully.',
        //   type: 'positive',
        //   position: 'top-right',
        // });
      } catch (error) {
        this.error = error.message;
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'Error fetching users.',
        //   type: 'negative',
        //   position: 'top-right',
        // });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get(`/users/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: 'User fetched successfully.',
        //   type: 'positive',
        //   position: 'top-right',
        // });
        return response.data;
      } catch (error) {
        this.error = error.message;
        // const notificationsStore = useNotificationsStore();
        // notificationsStore.createNotification({
        //   message: `Error fetching user with ID ${id}.`,
        //   type: 'negative',
        //   position: 'top-right',
        // });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    emptyRoles() {
      this.roles = [];
    },
    setRoles(roles) {
      this.roles = roles;
    },
    setLastName(lastName) {
      this.lastName = lastName;
    },
    setFirstName(firstName) {
      this.firstName = firstName;
    },
    setTel(tel) {
      this.tel = tel;
    },
    setPosition(position) {
      this.position = position;
    },
    setWorkplace(workplace) {
      this.workplace = workplace;
    },
    setEmail(email) {
      this.email = email;
    },
  },
});
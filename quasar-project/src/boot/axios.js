import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
// mf don't find the store without the .js at the end ?
import { useAuthStore } from '../stores/authStore.js'
import { watch } from 'vue';


// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

const api = axios.create({ baseURL: 'http://localhost:8000/api' });


export default defineBoot(({ app }) => {
  const authStore = useAuthStore();

// add an interceptor to include the token within the requests
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  } else {
    console.warn("Token is not available for the interceptor.");
  }
  return config;
});

  // Update Axios when the token is renewed
  watch(() => authStore.token, (newToken) => {
    api.defaults.headers.common['Authorization'] = newToken ? `Bearer ${newToken}` : '';
  });


  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }

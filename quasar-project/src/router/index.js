import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes.js'
import { useAuthStore } from 'src/stores/authStore'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Guard global pour empêcher l'accès à login/register si connecté et autres pages si pas connecté
  Router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const publicPages = ['login', 'register']
  if (!authStore.isAuthenticated && !publicPages.includes(to.name)) {
    next({ name: 'login' })
  } else if (authStore.isAuthenticated && publicPages.includes(to.name)) {
    next({ name: 'questionnaire' })
  } else {
    next()
  }
})

  return Router
})

const routes = [

  {
    path: '/',
    redirect: '/login', // Redirect to login page default
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // {
      //   path: 'dashboard',
      //   name: 'Dashboard',
      //   component: () => import('src/pages/dashboard/DashboardUser.vue'),
      //   meta: { requiresAuth: true },
      // },
      {
        path: 'login',
        name: 'Login',
        component: () => import('src/pages/auth/LoginUser.vue')
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

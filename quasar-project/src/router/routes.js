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
        name: 'login',
        component: () => import('src/pages/auth/LoginUser.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('src/pages/auth/RegisterUser.vue')
      },
      {
        path: 'questionnaire',
        name: 'questionnaire',
        component: () => import('src/pages/QuestionnairePage.vue'),
        // meta: { requiresAuth: true },
      },
      {
        path: 'resultat',
        name: 'resultat',
        component: () => import('src/pages/ResultatPage.vue'),
        // meta: { requiresAuth: true },
      }
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

import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Middleware pour gérer les accès
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user'); // Simple check (à améliorer)
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;

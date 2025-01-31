import { createRouter, createWebHistory } from 'vue-router';
import ProductListView from '@/views/ProductListView.vue';


const routes = [
  { path: '/', component: ProductListView },
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

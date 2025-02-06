import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

// Import des vues
import HomeView from '@/views/HomeView.vue';
import ProductListView from '@/views/ProductListView.vue';
import ProductDetailView from '@/views/ProductDetailView.vue';
import OrderListView from '@/views/OrderListView.vue';
import OrderDetailView from '@/views/OrderDetailView.vue';
import CartView from '@/views/CartView.vue';
import InvoiceListView from '@/views/InvoiceListView.vue';
import InvoiceDetailView from '@/views/InvoiceDetailView.vue';
import UserListView from '@/views/UserListView.vue';
import ProfileView from '@/views/ProfileView.vue';
import LoginView from '@/views/LoginView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

// Définition des rôles autorisés par page
const routes = [
  { path: '/', component: HomeView, name: 'Home' },
  { path: '/products', component: ProductListView, name: 'products', meta: { requiresAuth: true, roles: ['store'] }  },
  { path: '/product/:id', component: ProductDetailView, name: 'ProductDetail', meta: { requiresAuth: true, roles: ['store'] } },
  { path: '/orders', component: OrderListView, name: 'Orders', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/order/:id', component: OrderDetailView, name: 'OrderDetail', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/cart', component: CartView, name: 'Cart', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/invoices', component: InvoiceListView, name: 'Invoices', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/invoice/:id', component: InvoiceDetailView, name: 'InvoiceDetail', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/users', component: UserListView, name: 'Users', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/profile', component: ProfileView, name: 'Profile', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/login', component: LoginView, name: 'Login' },
  { path: '/:pathMatch(.*)*', component: NotFoundView, name: 'NotFound' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Middleware de protection des routes
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const userRole = userStore.getRole();
  
  if (to.meta.requiresAuth) {
    if (!userRole) {
      return next('/login'); // Redirige vers la connexion si l'utilisateur n'est pas connecté
    }

    if (!to.meta.roles.includes(userRole)) {
      return next('/'); // Redirige vers l'accueil si l'accès est interdit
    }
  }

  next();
});

export default router;

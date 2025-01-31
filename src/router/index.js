import { createRouter, createWebHistory } from 'vue-router';

// Import des vues
import ProductListView from '@/views/ProductListView.vue';
import OrderListView from '@/views/OrderListView.vue';
import CartView from '@/views/CartView.vue';
import InvoiceListView from '@/views/InvoicesListView.vue';
import UserListView from '@/views/UserListView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

// Définition des routes
const routes = [
  { path: '/', component: ProductListView, name: 'Home' },
  { path: '/orders', component: OrderListView, name: 'Orders' },
  { path: '/cart', component: CartView, name: 'Cart' },
  { path: '/invoices', component: InvoiceListView, name: 'Invoices' },
  { path: '/users', component: UserListView, name: 'Users' },
  { path: '/:pathMatch(.*)*', component: NotFoundView, name: 'NotFound' } // Gestion des pages 404
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

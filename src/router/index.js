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
import ProductCreateView from '@/views/ProductCreateView.vue';
import UserCreateView from '@/views/UserCreateView.vue';
import UserEditView from '@/views/UserEditView.vue';
import ProductEditView from '@/views/ProductEditView.vue';
import StockArrivalsView from '@/views/StockArrivalsView.vue';
import StockArrivalsCreateView from '@/views/StockArrivalsCreateView.vue';
import StockArrivalsEditView from '@/views/StockArrivalsEditView.vue';
// Définition des rôles autorisés par page
const routes = [
  { path: '/', component: HomeView, name: 'Home' },
  { path: '/products', component: ProductListView, name: 'products', meta: { requiresAuth: true, roles: ['store','admin']}  },
  { path: '/product/:id', component: ProductDetailView, name: 'ProductDetail', meta: { requiresAuth: true, roles: ['store','admin'] } },
  { path: '/product/create', component: ProductCreateView, name: 'product-create', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/product/edit/:id', component: ProductEditView, name: 'product-edit', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/orders', component: OrderListView, name: 'Orders', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/order/:id', component: OrderDetailView, name: 'OrderDetail', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/cart', component: CartView, name: 'Cart', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/stock-arrivals',component: StockArrivalsView,  name: 'stock-arrivals',  meta: { requiresAuth: true, roles: ['admin'] }}, 
  { path: '/stock-arrivals/create',component: StockArrivalsCreateView,  name: 'stock-arrivals-create',  meta: { requiresAuth: true, roles: ['admin'] }}, 
  { path: '/stock-arrivals/edit/:id',component: StockArrivalsEditView,  name: 'stock-arrivals-edit',  meta: { requiresAuth: true, roles: ['admin'] }}, 
  { path: '/invoices', component: InvoiceListView, name: 'Invoices', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/invoice/:id', component: InvoiceDetailView, name: 'InvoiceDetail', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/users', component: UserListView, name: 'Users', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/user/create', component: UserCreateView, name: 'Users-create', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/user/edit/:id', component: UserEditView, name: 'User-edit', meta: { requiresAuth: true, roles: ['admin'] } },
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
      return next('/login'); // Redirection vers la connexion si l'utilisateur n'est pas connecté
    }

    if (!to.meta.roles.includes(userRole)) {
      return next('/'); // Redirige vers l'accueil si l'accès est interdit
    }
  }
  next();
});


export default router;

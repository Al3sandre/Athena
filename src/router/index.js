import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

// Import des vues
import HomeView from '@/views/HomeView.vue';
import ProductListView from '@/views/ProductListView.vue';
import ProductDetailView from '@/views/ProductDetailView.vue';
import OrderListView from '@/views/OrderListView.vue';
import OrderDetailView from '@/views/OrderDetailView.vue';
import CartView from '@/views/CartView.vue';
import UserListView from '@/views/UserListView.vue';
import ProfileView from '@/views/ProfileView.vue';
import LoginView from '@/views/LoginView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import ProductCreateView from '@/views/ProductCreateView.vue';
import UserCreateView from '@/views/UserCreateView.vue';
import UserEditView from '@/views/UserEditView.vue';
import StockArrivalsView from '@/views/StockArrivalsView.vue';
import StockArrivalsCreateView from '@/views/StockArrivalsCreateView.vue';
import StockArrivalsEditView from '@/views/StockArrivalsEditView.vue';
import ArrivalManagementView from '@/views/ArrivalManagementView.vue';
import NewArrivalView from '@/views/NewArrivalView.vue';
import ArrivalDetailView from '@/views/ArrivalDetailView.vue';
import InventoryManagementView from '@/views/InventoryManagementView.vue';

const routes = [
  { path: '/', component: HomeView, name: 'Home', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/products', component: ProductListView, name: 'products', meta: { requiresAuth: true, roles: ['store', 'admin'] } },
  { path: '/product/:id', component: ProductDetailView, name: 'ProductDetail', meta: { requiresAuth: true, roles: ['store', 'admin'] } },
  { path: '/product/create', component: ProductCreateView, name: 'product-create', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/orders', component: OrderListView, name: 'Orders', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/order/:id', component: OrderDetailView, name: 'OrderDetail', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/cart', component: CartView, name: 'CartPage', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/stock-arrivals', component: StockArrivalsView, name: 'stock-arrivals', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/stock-arrivals/create', component: StockArrivalsCreateView, name: 'stock-arrivals-create', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/stock-arrivals/edit/:id', component: StockArrivalsEditView, name: 'stock-arrivals-edit', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/users', component: UserListView, name: 'Users', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/user/create', component: UserCreateView, name: 'Users-create', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/user/edit/:id', component: UserEditView, name: 'User-edit', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/profile', component: ProfileView, name: 'Profile', meta: { requiresAuth: true, roles: ['admin', 'store'] } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, name: 'NotFound' },
  { path: '/login', component: LoginView, name: 'Login' },
  { path: '/arrivals', component: ArrivalManagementView, name: 'ArrivalManagement', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/new-arrival', component: NewArrivalView, name: 'NewArrival', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/arrival/:id', component: ArrivalDetailView, name: 'ArrivalDetail', meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/inventory', component: InventoryManagementView, name: 'InventoryManagement', meta: { requiresAuth: true, roles: ['admin'] } },
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
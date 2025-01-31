import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; // Importation du router

const app = createApp(App);
app.use(createPinia());
app.use(router); // Utilisation de Vue Router
app.mount('#app');

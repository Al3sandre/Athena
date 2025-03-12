<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Connexion</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input v-model="email" type="email" placeholder="Email" required
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="password" type="password" placeholder="Mot de passe" required
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">Se
          connecter</button>
      </form>
      <p v-if="error" class="mt-4 text-red-500 text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useNotificationStore } from '@/stores/notifications';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  const success = await userStore.login(email.value, password.value);
  if (success) {
    router.push(router.currentRoute.value.query.redirect || '/'); // Redirection vers la page d’accueil après connexion
    notificationStore.clearNotifications();
  } else {
    error.value = "Identifiants incorrects.";
  }
};

// Ajouter une notification lorsque l'utilisateur accède à la page de connexion
onMounted(() => {
  if (!userStore.user) {
    notificationStore.addNotification("Si vous n'avez pas d'identifiant, veuillez vous rapprocher de l'administrateur.", 'info', 5000);
  }
});
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>
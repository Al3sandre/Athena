<template>
    <nav class="bg-gray-800 p-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <router-link v-if="user" to="/" class="text-white hover:text-gray-300">Accueil</router-link>
            <router-link v-if="user" to="/products" class="text-white hover:text-gray-300">Produits</router-link>
            <router-link v-if="user" to="/orders" class="text-white hover:text-gray-300">Commandes</router-link>
            <router-link v-if="isAdmin" to="/arrivals" class="text-white hover:text-gray-300">Arrivages</router-link>
            <router-link v-if="isAdmin" to="/inventory" class="text-white hover:text-gray-300">Inventaires</router-link>
            <router-link v-if="user" to="/profile" class="text-white hover:text-gray-300">Mon Profil</router-link>
            <router-link v-if="isAdmin" to="/users" class="text-white hover:text-gray-300">Utilisateurs</router-link>
            <router-link v-if="!user" to="/login" class="text-white hover:text-gray-300">Connexion</router-link>
        </div>
        <div class="flex items-center space-x-4">
            <CartWidget />
            <button v-if="user" @click="logout"
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200">
                Déconnexion ({{ user.name }})
            </button>
        </div>
    </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted } from 'vue';
import CartWidget from '@/components/CartWidget.vue';

const userStore = useUserStore();

// Vérifiez le token et chargez l'utilisateur si nécessaire
onMounted(async () => {
    if (userStore.token) {
        const isValid = await userStore.verifyToken();
        if (!isValid) {
            console.warn('Utilisateur non connecté ou token invalide.');
        }
    }
});

const user = computed(() => userStore.user);
const isAdmin = computed(() => userStore.isAdmin());

const logout = () => {
    if (userStore.token) {
        userStore.logout();
        window.location.href = '/login'; // Redirigez vers la page de connexion après la déconnexion
    }
};
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>

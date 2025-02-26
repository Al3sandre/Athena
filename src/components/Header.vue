<template>
    <nav>
        <router-link to="/">Accueil</router-link> |
        <router-link to="/products">Produits</router-link> |
        <router-link to="/orders">Commandes</router-link> |
        <router-link to="/cart">Panier</router-link> |
        <router-link to="/invoices">Factures</router-link> |
        <router-link v-if="isAdmin" to="/users">Utilisateurs</router-link> |
        <router-link to="/profile">Mon Profil</router-link> |
        <router-link v-if="!user" to="/login">Connexion</router-link>
        <button v-if="user" @click="logout">Déconnexion ({{ user.name }})</button>
    </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';
import { computed, watch } from 'vue';

const userStore = useUserStore();
userStore.loadUserFromSession();

const user = computed(() => userStore.user);
const isAdmin = computed(() => userStore.isAdmin());

const logout = () => {
    userStore.logout();
};
// Surveiller les changements dans l'état de l'utilisateur
watch(user, (newUser) => {
    if (!newUser) {
        // Rediriger l'utilisateur vers la page de connexion
        userStore.loadUserFromSession();
        if (!newUser) {
            window.location.href = '/login';
        }
    }
});
</script>

<style scoped>
nav {
    background: #333;
    padding: 10px;
    display: flex;
    align-items: center;
}

nav a {
    color: white;
    text-decoration: none;
    margin-right: 10px;
}

button {
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px;
}

button:hover {
    background: darkred;
}
</style>

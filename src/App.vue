<template>
    <div id="app">
        <nav>
            <router-link to="/">Accueil</router-link> |
            <router-link to="/products">Produits</router-link> |
            <router-link to="/orders">Commandes</router-link> |
            <router-link to="/cart">Panier</router-link> |
            <router-link to="/invoices">Factures</router-link> |
            <router-link to="/users">Utilisateurs</router-link> |
            <router-link to="/profile">Mon Profil</router-link> |
            <router-link v-if="!userStore.user" to="/login">Connexion</router-link>
            <button v-if="userStore.user" @click="logout">Déconnexion ({{ userStore.user.name }})</button>
        </nav>

        <router-view></router-view>
    </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
userStore.loadUserFromStorage();

const logout = () => {
    userStore.logout();
    window.location.reload(); // Recharge la page pour appliquer les changements
};
</script>

<style>
nav {
    background: #333;
    padding: 10px;
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
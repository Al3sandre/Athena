<template>
    <div id="app">
        <nav>
            <router-link to="/">Home</router-link> |
            <router-link to="/products">Produits</router-link> |
            <router-link to="/orders">Commandes</router-link> |
            <router-link to="/cart">Panier</router-link> |
            <router-link to="/invoices">Factures</router-link> |
            <router-link to="/users">Utilisateurs</router-link> |
            <router-link to="/profile">Mon Profil</router-link> |
            <router-link to="/login">Connexion</router-link>
        </nav>

        <router-view></router-view>
    </div>
</template>

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
</style>
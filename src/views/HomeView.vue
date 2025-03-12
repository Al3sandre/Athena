<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Bienvenue sur l'application</h1>
        <p class="mb-4">Gérez vos produits, commandes et bien plus encore.</p>

        <router-link to="/products">
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Voir les produits
            </button>
        </router-link>
    </div>
</template>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>
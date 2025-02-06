<template>
    <div>
        <h1>Bienvenue sur l'application</h1>
        <p>Gérez vos produits, commandes et bien plus encore.</p>

        <router-link to="/products">
            <button>Voir les produits</button>
        </router-link>
    </div>
</template>

<style scoped>
h1 {
    color: #333;
}

button {
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}

button:hover {
    background: #0056b3;
}
</style>
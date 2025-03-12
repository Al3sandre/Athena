<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 class="text-6xl font-bold mb-4">Erreur 404</h1>
        <p class="text-xl mb-4">La page demandée n'existe pas.</p>
        <div class="relative w-64 h-64 mb-4">
            <img src="https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif" alt="Funny 404"
                class="w-full h-full object-cover rounded-full shadow-lg" />
            <div class="absolute inset-0 flex items-center justify-center">
                <button @click="toggleMessage"
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                    Cliquez-moi!
                </button>
            </div>
        </div>
        <p v-if="showMessage" class="text-lg text-center mb-4">Oops! Vous avez trouvé un trou noir!</p>
        <router-link to="/"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">
            Retour à l'accueil
        </router-link>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const showMessage = ref(false);

const toggleMessage = () => {
    showMessage.value = !showMessage.value;
};
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>
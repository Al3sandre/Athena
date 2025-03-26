<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Liste des Utilisateurs</h1>
        <router-link to="/user/create"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 mb-4 inline-block">
            Créer un nouvel utilisateur
        </router-link>
        <ul v-if="users.length" class="space-y-4">
            <li v-for="user in users" :key="user.id"
                class="bg-white p-4 rounded shadow-md flex justify-between items-center">
                <div>
                    <p class="font-semibold">{{ user.name }}</p>
                    <p>{{ user.role }}</p>
                </div>
                <router-link :to="{ name: 'User-edit', params: { id: user.id } }"
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200">
                    Modifier
                </router-link>
            </li>
        </ul>
        <p v-else>Aucun utilisateur trouvé.</p>
    </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted } from 'vue';

const userStore = useUserStore();
const users = computed(() => userStore.users);

onMounted(async () => {
    try {
        await userStore.fetchAllUsers(); // Recharger les utilisateurs
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
        alert('Impossible de charger la liste des utilisateurs.');
    }
});
</script>
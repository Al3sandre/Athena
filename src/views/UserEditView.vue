<template>
    <div class="p-4">
        <div v-if="user">
            <h1 class="text-2xl font-bold mb-4">Modification utilisateur {{ user.name }}</h1>
            <form @submit.prevent="updateUser" class="space-y-4">
                <div>
                    <label for="name" class="block mb-2">Nom :</label>
                    <input type="text" v-model="user.name" id="name" required
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label for="email" class="block mb-2">Email :</label>
                    <input type="email" v-model="user.email" id="email" required
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label for="role" class="block mb-2">Rôle :</label>
                    <select v-model="user.role" id="role" required
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="admin">Admin</option>
                        <option value="store">Store</option>
                    </select>
                </div>
                <button type="submit"
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                    Mettre à jour
                </button>
            </form>
        </div>
        <div v-else>
            <p>Chargement des données de l'utilisateur...</p>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { ref, onMounted } from 'vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const user = ref(null);

const fetchUser = async () => {
    try {
        user.value = await userStore.fetchUserById(route.params.id);
    } catch (error) {
        console.error('Erreur lors de la récupération de l’utilisateur :', error);
        alert('Impossible de charger les données de l’utilisateur.');
        router.push('/users'); // Rediriger vers la liste des utilisateurs en cas d'erreur
    }
};

const updateUser = async () => {
    try {
        await userStore.updateUser(user.value.id, {
            name: user.value.name,
            email: user.value.email,
            role: user.value.role
        });
        alert('Utilisateur mis à jour avec succès.');
        router.push('/users');
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l’utilisateur :', error);
        alert('Une erreur est survenue lors de la mise à jour de l’utilisateur.');
    }
};

onMounted(fetchUser);
</script>
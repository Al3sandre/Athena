<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Création d'un nouvel utilisateur</h1>
        <form @submit.prevent="createUser" class="space-y-4">
            <div>
                <label for="name" class="block mb-2">Nom :</label>
                <input type="text" v-model="name" id="name" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="email" class="block mb-2">Email :</label>
                <input type="email" v-model="email" id="email" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="password" class="block mb-2">Mot de passe :</label>
                <input type="password" v-model="password" id="password" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="role" class="block mb-2">Rôle :</label>
                <select v-model="role" id="role" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="admin">Admin</option>
                    <option value="store">Store</option>
                </select>
            </div>
            <button type="submit"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Créer
            </button>
        </form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';

const router = useRouter();
const userStore = useUserStore();
const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('store');

const createUser = async () => {
    try {
        await userStore.createUser({
            name: name.value,
            email: email.value,
            password: password.value,
            role: role.value,
        });
        alert('Utilisateur créé avec succès.');
        router.push('/Users'); // Redirection
    } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur :', error);
        alert('Une erreur est survenue lors de la création de l’utilisateur.');
    }
};
</script>
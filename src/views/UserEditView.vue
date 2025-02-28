<template>
    <div v-if="user">
        <h1>Modification utilisateur {{ user.name }}</h1>
        <form @submit.prevent="updateUser">
            <div>
                <label for="name">Nom :</label>
                <input type="text" v-model="user.name" id="name" required>
            </div>
            <div>
                <label for="email">Email :</label>
                <input type="email" v-model="user.email" id="email" required>
            </div>
            <div>
                <label for="role">Rôle :</label>
                <select v-model="user.role" id="role" required>
                    <option value="admin">Admin</option>
                    <option value="store">Store</option>
                </select>
            </div>
            <button type="submit">Mettre à jour</button>
        </form>
    </div>
    <div v-else>
        <p>Chargement des données de l'utilisateur...</p>
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
        console.error('Erreur lors de la récupération de l’utilisateur:', error);
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
        router.push('/users');
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
    }
};

onMounted(fetchUser);
</script>
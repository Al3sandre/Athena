<template>
    <div>
        <h1>Liste des Utilisateurs</h1>
        <router-link to="/user/create">Créer un nouvel utilisateur</router-link>
        <ul>
            <li v-for="user in users" :key="user.id">
                {{ user.name }} - {{ user.role }}
                <router-link :to="{ name: 'User-edit', params: { id: user.id } }">Modifier</router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted } from 'vue';

const userStore = useUserStore();
const users = computed(() => userStore.users);

onMounted(async () => {
    await userStore.fetchAllUsers();
});
</script>
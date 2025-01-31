<template>
    <div>
        <h1>Liste des Utilisateurs</h1>
        <ul>
            <li v-for="user in users" :key="user.id">
                {{ user.name }} - {{ user.role }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();
const users = computed(() => userStore.users);
</script>
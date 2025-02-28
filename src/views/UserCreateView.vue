<template>
    <div>
        <h1>Création d'un nouvel utilisateur</h1>
        <form @submit.prevent="createUser">
            <div>
                <label for="name">Nom :</label>
                <input type="text" v-model="name" id="name" required>
            </div>
            <div>
                <label for="email">Email :</label>
                <input type="email" v-model="email" id="email" required>
            </div>
            <div>
                <label for="password">Mot de passe :</label>
                <input type="password" v-model="password" id="password" required>
            </div>
            <div>
                <label for="role">Rôle :</label>
                <select v-model="role" id="role" required>
                    <option value="admin">Admin</option>
                    <option value="store">Store</option>
                </select>
            </div>
            <button type="submit">Créer</button>
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
    await userStore.createUser({
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value
    });
    router.push('/users');
};
</script>
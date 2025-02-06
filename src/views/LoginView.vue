<template>
    <div>
        <h1>Connexion</h1>
        <form @submit.prevent="handleLogin">
            <input v-model="email" type="email" placeholder="Email" required />
            <input v-model="password" type="password" placeholder="Mot de passe" required />
            <button type="submit">Se connecter</button>
        </form>
        <p v-if="error" style="color: red;">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = () => {
    if (userStore.login(email.value, password.value)) {
        router.push('/'); // Redirection vers la page d’accueil après connexion
    } else {
        error.value = "Identifiants incorrects.";
    }
};
</script>

<style scoped>
input {
    display: block;
    margin: 10px 0;
    padding: 8px;
    width: 200px;
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
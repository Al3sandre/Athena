<template>
    <div>
        <h1>Mon Profil</h1>
        <p>Bienvenue sur votre espace utilisateur.</p>
        <div v-if="user">
            <div>
                <label for="email">Email :</label>
                <input v-model="user.email" id="email" type="email" />
            </div>
            <div>
                <label for="name">Nom :</label>
                <input v-model="user.name" id="name" type="text" />
            </div>
            <div>
                <label for="role">Rôle :</label>
                <input v-model="user.role" id="role" type="text" disabled />
            </div>
            <div>
                <label for="avatar">Avatar :</label>
                <img :src="userStore.getImageUrl(user)" alt="Avatar de l'utilisateur" @click="triggerFileInput"
                    style="cursor: pointer;" />
                <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
            </div>
            <button @click="saveChanges">Enregistrer</button>
        </div>
        <p v-else>Chargement...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useNotificationStore } from '@/stores/notifications';

const userStore = useUserStore();
const notificationStore = useNotificationStore();

const user = ref(null);
const imageFile = ref(null);
const fileInput = ref(null);

onMounted(async () => {
    await userStore.loadUserFromSession();
    user.value = { ...userStore.user }; // Cloner l'utilisateur pour éviter les modifications directes
});

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileUpload = (event) => {
    imageFile.value = event.target.files[0];
};

const saveChanges = async () => {
    try {
        let updatedUser;
        if (imageFile.value) {
            const formData = new FormData();
            formData.append('email', user.value.email);
            formData.append('name', user.value.name);
            formData.append('role', user.value.role);
            formData.append('avatar', imageFile.value);

            // Ajout de logs pour déboguer
            for (let pair of formData.entries()) {
            }

            updatedUser = await userStore.updateUser(user.value.id, formData);
        } else {
            updatedUser = await userStore.updateUser(user.value.id, user.value);
        }
        userStore.user = updatedUser; // Mettre à jour l'utilisateur dans le store
        user.value.avatar = updatedUser.avatar;
        notificationStore.clearNotifications();
        notificationStore.addNotification('Profil mis à jour avec succès.', 'success',);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        notificationStore.clearNotifications();
        notificationStore.addNotification('Erreur lors de la mise à jour du profil.', 'error',);
    }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
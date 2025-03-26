<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Mon Profil</h1>
        <p class="mb-4">Bienvenue sur votre espace utilisateur.</p>
        <div v-if="user" class="space-y-4">
            <div>
                <label for="email" class="block mb-2">Email :</label>
                <input v-model="user.email" id="email" type="email"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="name" class="block mb-2">Nom :</label>
                <input v-model="user.name" id="name" type="text"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="avatar" class="block mb-2">Avatar :</label>
                <img :src="userStore.getImageUrl(user)" alt="Avatar de l'utilisateur" @click="triggerFileInput"
                    class="cursor-pointer w-32 h-32 object-cover rounded-full mb-4" />
                <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" />
            </div>
            <button @click="saveChanges"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Enregistrer
            </button>
        </div>
        <p v-else>Chargement...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

const user = ref(null);
const imageFile = ref(null);
const fileInput = ref(null);

onMounted(async () => {
    try {
        await userStore.loadUserFromSession();
        user.value = { ...userStore.user }; // Cloner l'utilisateur pour éviter les modifications directes
    } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur :', error);
        alert('Impossible de charger les informations de l\'utilisateur. Veuillez vérifier votre connexion ou contacter l\'administrateur.');
    }
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
            formData.append('name', user.value.name);
            formData.append('email', user.value.email);
            formData.append('avatar', imageFile.value); // Inclure l'avatar comme fichier

            updatedUser = await userStore.updateUser(user.value.id, formData);
        } else {
            updatedUser = await userStore.updateUser(user.value.id, {
                name: user.value.name,
                email: user.value.email,
            });
        }

        // Mettre à jour l'utilisateur dans le store et localement
        userStore.user = updatedUser;
        user.value = { ...updatedUser }; // Mettre à jour l'utilisateur localement

        alert('Profil mis à jour avec succès.');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        alert('Une erreur est survenue lors de la mise à jour du profil.');
    }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
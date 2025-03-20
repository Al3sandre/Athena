<template>
    <div class="fixed top-10 right-10 z-50 space-y-4">
        <div v-for="notification in notifications" :key="notification.id" :class="notificationClass(notification.type)"
            @click="remove(notification.id)" class="cursor-pointer">
            {{ notification.message }}
        </div>
    </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notifications';
import { computed } from 'vue';

const notificationStore = useNotificationStore();
const notifications = computed(() => notificationStore.notifications);

// Méthode pour supprimer une notification
const remove = (id) => {
    notificationStore.removeNotification(id);
};

const notificationClass = (type) => {
    switch (type) {
        case 'info':
            return 'bg-blue-500 text-white p-4 rounded shadow-md';
        case 'error':
            return 'bg-red-500 text-white p-4 rounded shadow-md';
        default:
            return 'bg-gray-800 text-white p-4 rounded shadow-md';
    }
};
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>
<template>
    <div class="notifications">
        <div v-for="notification in notifications" :key="notification.id" :class="`notification ${notification.type}`">
            {{ notification.message }}
        </div>
    </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notifications';
import { computed } from 'vue';

const notificationStore = useNotificationStore();
const notifications = computed(() => notificationStore.notifications);
</script>

<style scoped>
.notifications {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
}

.notification {
    background: #333;
    color: white;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
}

.notification.info {
    background: #007bff;
}

.notification.error {
    background: #dc3545;
}
</style>
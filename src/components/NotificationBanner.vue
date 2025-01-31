<template>
    <div v-if="notifications.length" class="notification-container">
        <div v-for="note in notifications" :key="note.id" :class="['notification', note.type]">
            {{ note.message }}
        </div>
    </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification';
const { notifications } = useNotificationStore();
</script>

<style>
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
}

.notification {
    background: lightgray;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 5px;
}

.notification.info {
    background: blue;
    color: white;
}

.notification.success {
    background: green;
    color: white;
}

.notification.error {
    background: red;
    color: white;
}
</style>
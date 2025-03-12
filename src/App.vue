<template>
    <div id="app" class="min-h-screen bg-gray-100">
        <Header />
        <CartWidget />
        <router-view></router-view>
        <Notification />
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Notification from '@/components/NotificationBanner.vue';
import CartWidget from '@/components/CartWidget.vue';
</script>

<style>
/* Vous pouvez supprimer les styles CSS personnalisés si vous utilisez Tailwind CSS */
</style>
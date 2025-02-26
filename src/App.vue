<template>
    <div id="app">
        <Header />
        <router-view></router-view>
        <Notification />
    </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Notification from '@/components/NotificationBanner.vue';
</script>


<style>
nav {
    background: #333;
    padding: 10px;
}

nav a {
    color: white;
    text-decoration: none;
    margin-right: 10px;
}

button {
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    padding: 5px;
}

button:hover {
    background: darkred;
}
</style>
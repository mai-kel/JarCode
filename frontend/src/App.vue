<template>
  <header>
    <NavBar />
  </header>

  <main>
    <Toast />
    <router-view />
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import NavBar from './components/layout/NavBar.vue';
import { useAuthStore } from './store/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.fetchUser();
});
</script>

<style scoped>
main {
  padding-top: 2rem;
}
</style>

<template>
  <div v-if="!authStore.isReady" class="app-splash">
    <ProgressSpinner style="width: 64px; height: 64px" stroke-width="6" />
  </div>
  <div v-else>
    <header>
      <NavBar />
    </header>

    <main>
      <Toast />
      <ConfirmDialog />
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import NavBar from './components/layout/NavBar.vue';
import { useAuthStore } from './store/auth';
import ProgressSpinner from 'primevue/progressspinner';

const authStore = useAuthStore();

onMounted(() => {
  authStore.fetchUser();
});
</script>

<style scoped>
main {
  padding-top: 2rem;
}
.app-splash {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

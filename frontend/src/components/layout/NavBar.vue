<template>
  <Menubar :model="items">
    <template #start>
      <div class="flex align-items-center mr-4">
        <i class="pi pi-code" style="font-size: 1.5rem"></i>
        <span class="font-bold text-lg ml-2">JarCode</span>
      </div>
    </template>
    <template #end>
      <Button v-if="authStore.isAuthenticated"
              label="Logout"
              icon="pi pi-sign-out"
              @click="handleLogout"
              class="p-button-text" />
    </template>
  </Menubar>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
};

const items = computed(() => [
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => router.push({ name: 'home' })
  },
  {
    label: 'Login',
    icon: 'pi pi-sign-in',
    command: () => router.push({ name: 'login' }),
    visible: () => !authStore.isAuthenticated
  },
  {
    label: 'Register',
    icon: 'pi pi-user-plus',
    command: () => router.push({ name: 'register' }),
    visible: () => !authStore.isAuthenticated
  }
]);
</script>

<style scoped>
.p-menubar {
  border-radius: 0.5rem;
}
</style>

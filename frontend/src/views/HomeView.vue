<template>
  <Card>
    <template #title>
      <h2>Welcome to JarCode</h2>
    </template>
    <template #content>
      <p v-if="!authStore.isAuthenticated">
        Welcome to JarCode. Please
        <router-link to="/login">login</router-link> or
        <router-link to="/register">register</router-link> to get started.
      </p>
      <p v-else>Welcome back, {{ authStore.user.first_name }}!</p>

      <div v-if="authStore.isAuthenticated" class="mt-4">
        <div class="grid">
          <div v-for="item in visibleItems" :key="item.label" class="col-12 md:col-4 lg:col-3 mb-3">
            <Button
              :label="item.label"
              :icon="item.icon"
              class="w-full p-button-lg p-button-outlined"
              style="height: 6rem; font-size: 1.05rem"
              @click="item.command"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const visibleItems = computed(() => {
  const items = [
    {
      label: 'Browse Courses',
      icon: 'pi pi-search',
      command: () => router.push({ name: 'browse-courses' }),
      visible: authStore.isReady && authStore.isAuthenticated,
    },
    {
      label: 'Browse Problems',
      icon: 'pi pi-list',
      command: () => router.push({ name: 'browse-problems' }),
      visible: authStore.isReady && authStore.isAuthenticated,
    },
    {
      label: 'My Courses',
      icon: 'pi pi-book',
      command: () => router.push({ name: 'my-courses' }),
      visible: authStore.isReady && authStore.isAuthenticated && authStore.user?.is_content_creator,
    },
    {
      label: 'My Problems',
      icon: 'pi pi-question-circle',
      command: () => router.push({ name: 'my-problems' }),
      visible: authStore.isReady && authStore.isAuthenticated && authStore.user?.is_content_creator,
    },
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => router.push({ name: 'profile' }),
      visible: authStore.isReady && authStore.isAuthenticated,
    },
  ];

  return items.filter((i) => i.visible);
});
</script>

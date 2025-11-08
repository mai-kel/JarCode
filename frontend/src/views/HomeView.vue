<template>
  <div class="grid">
    <div class="col-12">
      <Card>
        <template #title>
          Welcome to JarCode!
        </template>
        <template #content>
          <p v-if="!authStore.isAuthenticated">
            Welcome to JarCode.
            Please <router-link to="/login">login</router-link> or
            <router-link to="/register">register</router-link> to get started.
          </p>
          <p v-else>
            Welcome back, {{ authStore.user.first_name }}!
          </p>
          <p>
            Courses, programming problems and more.
          </p>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth';
const authStore = useAuthStore();
</script>

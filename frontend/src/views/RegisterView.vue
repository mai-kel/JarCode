<template>
  <div v-if="!registered" class="form-container" >
    <Card class="form-card">
      <template #title>
        <h2 class="text-center">Create Account</h2>
      </template>
      <template #content>
        <div v-if="!registered">
          <form @submit.prevent="handleRegister">
            <div class="p-fluid">

              <div class="field">
                <label for="first_name">First Name</label>
                <InputText id="first_name" v-model="formData.first_name" type="text" />
                <small v-if="authStore.error?.first_name" class="p-error">{{ authStore.error.first_name.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="last_name">Last Name</label>
                <InputText id="last_name" v-model="formData.last_name" type="text" />
                <small v-if="authStore.error?.last_name" class="p-error">{{ authStore.error.last_name.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="email">Email</label>
                <InputText id="email" v-model="formData.email" type="email" />
                <small v-if="authStore.error?.email" class="p-error">{{ authStore.error.email.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="password">Password</label>
                <InputText id="password" v-model="formData.password" type="password" />
                <small v-if="authStore.error?.password" class="p-error">{{ authStore.error.password.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="password2">Confirm Password</label>
                <InputText id="password2" v-model="formData.password2" type="password" />
                <small v-if="authStore.error?.password2" class="p-error">{{ authStore.error.password2.join(', ') }}</small>
              </div>

              <Message v-if="authStore.error && !authStore.error.first_name && !authStore.error.last_name && !authStore.error.email && !authStore.error.password && !authStore.error.password2" severity="error" :closable="false">
                {{ authStore.error.message || 'An unknown error occurred.' }}
              </Message>

              <Button type="submit" label="Register" class="mt-4" :loading="authStore.isLoading" />
            </div>
          </form>
        </div>
      </template>
      <template #footer>
        <div class="text-center">
          Already have an account? <router-link to="/login">Login here</router-link>
        </div>
      </template>
    </Card>
  </div>
  <Card v-else>
    <template #title>
      Account created
    </template>
    <template #content>
      <Message severity="info" :closable="false">
         Please check your email - a verification link will be sent shortly.
      </Message>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useToast } from 'primevue/usetoast';

const authStore = useAuthStore();
const toast = useToast();

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password2: ''
});
const registered = ref(false)

const handleRegister = async () => {
  const success = await authStore.register(formData.value);
  if (success) {
    registered.value = true
    formData.value = { first_name: '', last_name: '', email: '', password: '', password2: '' };
  }
};
</script>

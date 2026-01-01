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
                <small v-if="fieldErrors.first_name" class="p-error">{{ fieldErrors.first_name.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="last_name">Last Name</label>
                <InputText id="last_name" v-model="formData.last_name" type="text" />
                <small v-if="fieldErrors.last_name" class="p-error">{{ fieldErrors.last_name.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="email">Email</label>
                <InputText id="email" v-model="formData.email" type="email" />
                <small v-if="fieldErrors.email" class="p-error">{{ fieldErrors.email.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="password">Password</label>
                <InputText id="password" v-model="formData.password" type="password" />
                <small v-if="fieldErrors.password" class="p-error">{{ fieldErrors.password.join(', ') }}</small>
              </div>

              <div class="field">
                <label for="password2">Confirm Password</label>
                <InputText id="password2" v-model="formData.password2" type="password" />
                <small v-if="fieldErrors.password2" class="p-error">{{ fieldErrors.password2.join(', ') }}</small>
              </div>

              <Message v-if="fieldErrors._non_field && fieldErrors._non_field.length" severity="error" :closable="false">
                <div v-for="(m, i) in fieldErrors._non_field" :key="i">{{ m }}</div>
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
import { useAuthStore } from '../../store/auth';
import { parseApiErrorFields } from '../../utils/parseApiError';

const authStore = useAuthStore();

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password2: ''
});
const registered = ref(false);
const fieldErrors = ref({});

const handleRegister = async () => {
  const success = await authStore.register(formData.value);
  if (success) {
    registered.value = true;
    formData.value = { first_name: '', last_name: '', email: '', password: '', password2: '' };
    fieldErrors.value = {};
  } else {
    fieldErrors.value = authStore.error?.fields || parseApiErrorFields(authStore.error?.details || authStore.error);
  }
};
</script>

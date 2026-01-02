import { createApp } from 'vue';
import { config } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';

/**
 * Creates a test app with all necessary plugins
 */
export function createTestApp() {
  const app = createApp({});
  const pinia = createPinia();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: []
  });

  app.use(pinia);
  app.use(router);
  app.use(PrimeVue);
  app.use(ToastService);
  app.use(ConfirmationService);

  return { app, pinia, router };
}

/**
 * Wrapper for component testing with PrimeVue
 */
export function createComponentWrapper(component, options = {}) {
  const { app, pinia, router } = createTestApp();

  return {
    app,
    pinia,
    router,
    mount: (componentOptions = {}) => {
      return config.plugins.VueWrapper.extend({
        global: {
          plugins: [pinia, router, PrimeVue, ToastService, ConfirmationService]
        },
        ...options,
        ...componentOptions
      });
    }
  };
}


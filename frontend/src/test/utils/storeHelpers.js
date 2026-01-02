import { createPinia, setActivePinia } from 'pinia';
import { createMockRouter } from './testHelpers';

/**
 * Sets up Pinia for testing
 */
export function setupPinia() {
  setActivePinia(createPinia());
}

/**
 * Creates a mock router and sets it up for stores that need it
 */
export function setupRouter() {
  return createMockRouter();
}

/**
 * Resets Pinia state
 */
export function resetPinia() {
  setActivePinia(createPinia());
}

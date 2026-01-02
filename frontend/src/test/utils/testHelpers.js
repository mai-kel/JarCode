import { vi } from 'vitest';

/**
 * Creates a mock router for testing
 */
export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        name: 'home',
        path: '/',
        params: {},
        query: {},
        meta: {},
      },
    },
  };
}

/**
 * Creates a mock route for testing
 */
export function createMockRoute(overrides = {}) {
  return {
    name: 'home',
    path: '/',
    params: {},
    query: {},
    meta: {},
    ...overrides,
  };
}

/**
 * Waits for next tick
 */
export function waitForNextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates a delay for testing async operations
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mocks window.confirm
 */
export function mockConfirm(returnValue = true) {
  return vi.spyOn(window, 'confirm').mockReturnValue(returnValue);
}

/**
 * Mocks window.alert
 */
export function mockAlert() {
  return vi.spyOn(window, 'alert').mockImplementation(() => {});
}

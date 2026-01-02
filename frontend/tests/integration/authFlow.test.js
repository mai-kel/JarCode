import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../src/store/auth';
import * as userService from '../../src/services/userService';
import { createMockRouter } from '../../src/test/utils/testHelpers.js';

vi.mock('../../src/services/userService');
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: () => createMockRouter(),
  };
});

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should complete full login flow', async () => {
    const store = useAuthStore();
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_content_creator: true,
    };

    userService.initializeCSRF.mockResolvedValue(undefined);
    userService.login.mockResolvedValue(mockUser);

    const loginResult = await store.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(loginResult).toBe(true);
    expect(store.user).toEqual(mockUser);
    expect(store.isAuthenticated).toBe(true);

    userService.getCurrentUser.mockResolvedValue(mockUser);
    await store.fetchUser();
    expect(store.user).toEqual(mockUser);
  });

  it('should handle login error and not set user', async () => {
    const store = useAuthStore();
    const error = {
      message: 'Invalid credentials',
      status: 401,
      details: {},
    };

    userService.initializeCSRF.mockResolvedValue(undefined);
    userService.login.mockRejectedValue(error);

    const loginResult = await store.login({
      email: 'test@example.com',
      password: 'wrong',
    });

    expect(loginResult).toBe(false);
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.error).toBeDefined();
    expect(store.error.message).toBe('Invalid credentials');
  });

  it('should handle logout and clear user', async () => {
    const store = useAuthStore();
    store.user = {
      id: 1,
      email: 'test@example.com',
    };

    userService.initializeCSRF.mockResolvedValue(undefined);
    userService.logout.mockResolvedValue(undefined);

    await store.logout();

    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});

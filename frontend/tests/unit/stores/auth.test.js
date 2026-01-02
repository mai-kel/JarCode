import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../../src/store/auth';
import * as userService from '../../../src/services/userService';
import { createMockRouter } from '../../../src/test/utils/testHelpers.js';

vi.mock('../../../src/services/userService');
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: () => createMockRouter(),
  };
});

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and set user', async () => {
      const store = useAuthStore();
      const mockUser = { id: 1, email: 'test@example.com' };
      userService.login.mockResolvedValue(mockUser);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.login({ email: 'test@example.com', password: 'pass' });

      expect(result).toBe(true);
      expect(store.user).toEqual(mockUser);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should handle login error', async () => {
      const store = useAuthStore();
      const error = { message: 'Invalid credentials', status: 401 };
      userService.login.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.login({ email: 'test@example.com', password: 'wrong' });

      expect(result).toBe(false);
      expect(store.user).toBeNull();
      expect(store.error).toBeDefined();
      expect(store.error.message).toBe('Invalid credentials');
    });

    it('should initialize CSRF before login', async () => {
      const store = useAuthStore();
      userService.login.mockResolvedValue({ id: 1 });
      userService.initializeCSRF.mockResolvedValue(undefined);

      await store.login({ email: 'test@example.com', password: 'pass' });

      expect(userService.initializeCSRF).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const store = useAuthStore();
      userService.register.mockResolvedValue(undefined);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.register({
        email: 'test@example.com',
        password: 'pass',
        first_name: 'Test',
        last_name: 'User',
      });

      expect(result).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('should handle registration error', async () => {
      const store = useAuthStore();
      const error = { message: 'Email already exists', status: 400 };
      userService.register.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.register({ email: 'test@example.com' });

      expect(result).toBe(false);
      expect(store.error).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear user', async () => {
      const store = useAuthStore();
      store.user = { id: 1 };
      userService.logout.mockResolvedValue(undefined);
      userService.initializeCSRF.mockResolvedValue(undefined);

      await store.logout();

      expect(store.user).toBeNull();
      expect(store.isLoading).toBe(false);
    });

    it('should handle logout error', async () => {
      const store = useAuthStore();
      const error = { message: 'Logout failed', status: 500 };
      userService.logout.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      await store.logout();

      expect(store.error).toBeDefined();
    });
  });

  describe('fetchUser', () => {
    it('should fetch user successfully', async () => {
      const store = useAuthStore();
      const mockUser = { id: 1, email: 'test@example.com' };
      userService.getCurrentUser.mockResolvedValue(mockUser);
      userService.initializeCSRF.mockResolvedValue(undefined);

      await store.fetchUser();

      expect(store.user).toEqual(mockUser);
      expect(store.isLoading).toBe(false);
      expect(store.isReady).toBe(true);
    });

    it('should clear user on 401 error', async () => {
      const store = useAuthStore();
      store.user = { id: 1 };
      const error = { message: 'Unauthorized', status: 401 };
      userService.getCurrentUser.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      await store.fetchUser();

      expect(store.user).toBeNull();
      expect(store.isReady).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const store = useAuthStore();
      const updatedUser = { id: 1, first_name: 'Updated', last_name: 'Name' };
      userService.updateProfile.mockResolvedValue(updatedUser);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.updateProfile({ first_name: 'Updated', last_name: 'Name' });

      expect(result).toBe(true);
      expect(store.user).toEqual(updatedUser);
    });

    it('should handle update error', async () => {
      const store = useAuthStore();
      const error = { message: 'Update failed', status: 400 };
      userService.updateProfile.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.updateProfile({ first_name: 'Updated' });

      expect(result).toBe(false);
      expect(store.error).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const store = useAuthStore();
      userService.changePassword.mockResolvedValue(true);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.changePassword({
        user_id: 1,
        user_uuid: 'uuid',
        token: 'token',
        password: 'newpass',
        password2: 'newpass',
      });

      expect(result).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('should handle change password error', async () => {
      const store = useAuthStore();
      const error = { message: 'Invalid token', status: 400 };
      userService.changePassword.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.changePassword({});

      expect(result).toBe(false);
      expect(store.error).toBeDefined();
    });
  });

  describe('resendVerification', () => {
    it('should resend verification successfully', async () => {
      const store = useAuthStore();
      userService.resendVerification.mockResolvedValue(undefined);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.resendVerification('test@example.com');

      expect(result).toBe(true);
    });

    it('should handle resend verification error', async () => {
      const store = useAuthStore();
      const error = { message: 'Failed', status: 400 };
      userService.resendVerification.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.resendVerification('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset successfully', async () => {
      const store = useAuthStore();
      userService.sendPasswordReset.mockResolvedValue(undefined);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.sendPasswordReset('test@example.com');

      expect(result).toBe(true);
    });

    it('should handle send password reset error', async () => {
      const store = useAuthStore();
      const error = { message: 'Failed', status: 400 };
      userService.sendPasswordReset.mockRejectedValue(error);
      userService.initializeCSRF.mockResolvedValue(undefined);

      const result = await store.sendPasswordReset('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const store = useAuthStore();
      store.error = { message: 'Error' };
      store.clearError();
      expect(store.error).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user exists', () => {
      const store = useAuthStore();
      store.user = { id: 1 };
      expect(store.isAuthenticated).toBe(true);
    });

    it('should return false when user is null', () => {
      const store = useAuthStore();
      store.user = null;
      expect(store.isAuthenticated).toBe(false);
    });
  });
});

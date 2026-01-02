import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../../../src/services/userService';
import apiClient from '../../../src/services/api';

vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
  initCSRF: vi.fn(),
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeCSRF', () => {
    it('should call initCSRF', async () => {
      const { initCSRF } = await import('../../../src/services/api');
      initCSRF.mockResolvedValue(undefined);

      await userService.initializeCSRF();

      expect(initCSRF).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call login endpoint with credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { data: { id: 1, email: 'test@example.com' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await userService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/users/login/', credentials);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('register', () => {
    it('should call register endpoint with details', async () => {
      const details = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };
      apiClient.post.mockResolvedValue({ data: {} });

      await userService.register(details);

      expect(apiClient.post).toHaveBeenCalledWith('/users/register/', details);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      apiClient.post.mockResolvedValue({});

      await userService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/users/logout/');
    });
  });

  describe('getCurrentUser', () => {
    it('should call me endpoint and return user data', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      apiClient.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/users/me/');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should call me endpoint with PUT and return updated user', async () => {
      const payload = { first_name: 'Updated', last_name: 'Name' };
      const mockUser = { id: 1, ...payload };
      apiClient.put.mockResolvedValue({ data: mockUser });

      const result = await userService.updateProfile(payload);

      expect(apiClient.put).toHaveBeenCalledWith('/users/me/', payload);
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyAccount', () => {
    it('should call verify-account endpoint and return success status', async () => {
      const payload = { user_id: 1, user_uuid: 'uuid', token: 'token' };
      apiClient.post.mockResolvedValue({ status: 200 });

      const result = await userService.verifyAccount(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/users/verify-account/', payload);
      expect(result).toBe(true);
    });
  });

  describe('resendVerification', () => {
    it('should call resend-verification-link endpoint with email', async () => {
      const email = 'test@example.com';
      apiClient.post.mockResolvedValue({});

      await userService.resendVerification(email);

      expect(apiClient.post).toHaveBeenCalledWith('/users/resend-verification-link/', { email });
    });
  });

  describe('sendPasswordReset', () => {
    it('should call send-password-reset-link endpoint with email', async () => {
      const email = 'test@example.com';
      apiClient.post.mockResolvedValue({});

      await userService.sendPasswordReset(email);

      expect(apiClient.post).toHaveBeenCalledWith('/users/send-password-reset-link/', { email });
    });
  });

  describe('changePassword', () => {
    it('should call change-password endpoint and return success status', async () => {
      const payload = {
        user_id: 1,
        user_uuid: 'uuid',
        token: 'token',
        password: 'newpass',
        password2: 'newpass',
      };
      apiClient.put.mockResolvedValue({ status: 200 });

      const result = await userService.changePassword(payload);

      expect(apiClient.put).toHaveBeenCalledWith('/users/change-password/', payload);
      expect(result).toBe(true);
    });
  });
});

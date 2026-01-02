import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useProblemStore } from '../../src/store/problem';
import { useAuthStore } from '../../src/store/auth';
import * as problemService from '../../src/services/problemService';
import * as userService from '../../src/services/userService';
import { createMockRouter } from '../../src/test/utils/testHelpers.js';

vi.mock('../../src/services/problemService');
vi.mock('../../src/services/userService');
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: () => createMockRouter()
  };
});

describe('Error Handling Flow Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should propagate API error through service -> store -> component', async () => {
    const store = useProblemStore();
    const apiError = {
      message: 'Validation failed',
      status: 400,
      details: {
        title: ['This field is required'],
        difficulty: ['Invalid choice']
      }
    };

    problemService.createProblem.mockRejectedValue(apiError);

    const result = await store.createProblem({});

    expect(result).toBeNull();
    expect(store.error).toBeDefined();
    expect(store.error.message).toBe('Validation failed');
    expect(store.error.status).toBe(400);
    expect(store.error.details).toEqual(apiError.details);
  });

  it('should handle network error', async () => {
    const store = useAuthStore();
    const networkError = {
      message: 'Network error',
      request: {},
      response: undefined
    };

    userService.initializeCSRF.mockResolvedValue(undefined);
    userService.login.mockRejectedValue(networkError);

    const result = await store.login({
      email: 'test@example.com',
      password: 'pass'
    });

    expect(result).toBe(false);
    expect(store.error).toBeDefined();
    expect(store.error.message).toBe('Network error');
  });

  it('should clear error when new operation succeeds', async () => {
    const store = useProblemStore();

    const error = { message: 'Failed', status: 400 };
    problemService.createProblem.mockRejectedValueOnce(error);
    await store.createProblem({});
    expect(store.error).toBeDefined();

    const mockProblem = { id: 1, title: 'Success' };
    problemService.createProblem.mockResolvedValueOnce(mockProblem);
    await store.createProblem({ title: 'Success' });

    expect(store.error).toBeNull();
    expect(store.currentProblem).toEqual(mockProblem);
  });
});


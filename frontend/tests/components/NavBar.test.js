import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, computed, nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import NavBar from '../../src/components/layout/NavBar.vue';
import { useAuthStore } from '../../src/store/auth';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../../src/store/auth', () => ({
  useAuthStore: vi.fn()
}));

const mockRoutes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/browse-courses', name: 'browse-courses', component: { template: '<div>Courses</div>' } },
  { path: '/problems', name: 'browse-problems', component: { template: '<div>Problems</div>' } },
  { path: '/my-courses', name: 'my-courses', component: { template: '<div>My Courses</div>' } },
  { path: '/my-problems', name: 'my-problems', component: { template: '<div>My Problems</div>' } },
  { path: '/profile', name: 'profile', component: { template: '<div>Profile</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
  { path: '/register', name: 'register', component: { template: '<div>Register</div>' } }
];

describe('NavBar', () => {
  let wrapper;
  let router;
  let mockAuthStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: mockRoutes
    });

    const userRef = ref(null);
    const isReadyRef = ref(true);
    mockAuthStore = {
      get isReady() { return isReadyRef.value; },
      set isReady(val) { isReadyRef.value = val; },
      _isReady: isReadyRef,
      get isAuthenticated() { return !!userRef.value; },
      get user() { return userRef.value; },
      set user(val) { userRef.value = val; },
      _user: userRef,
      logout: vi.fn(),
      fetchUser: vi.fn().mockResolvedValue(null)
    };

    useAuthStore.mockReturnValue(mockAuthStore);
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return mount(NavBar, {
      global: {
        plugins: [router],
        stubs: {
          Menubar: {
            template: '<div class="menubar"><slot name="start" /><slot name="end" /><div v-for="item in model" :key="item.label" @click="item.command && item.command()">{{ item.label }}</div></div>',
            props: ['model']
          },
          Button: {
            template: '<button @click="$emit(\'click\')">{{ label }}<slot /></button>',
            props: ['label', 'icon', 'class']
          }
        }
      }
    });
  };

  it('should render logo and brand name', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toContain('JarCode');
  });

  it('should show login and register when not authenticated', () => {
    mockAuthStore._user.value = null;
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const items = wrapper.vm.items;
    const loginItem = items.find(item => item.label === 'Login');
    const registerItem = items.find(item => item.label === 'Register');

    expect(loginItem).toBeTruthy();
    expect(loginItem.visible()).toBe(true);
    expect(registerItem).toBeTruthy();
    expect(registerItem.visible()).toBe(true);
  });

  it('should hide login and register when authenticated', () => {
    mockAuthStore._user.value = { id: 1 };
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const items = wrapper.vm.items;
    const loginItem = items.find(item => item.label === 'Login');
    const registerItem = items.find(item => item.label === 'Register');

    expect(loginItem.visible()).toBe(false);
    expect(registerItem.visible()).toBe(false);
  });

  it('should show authenticated menu items when authenticated', () => {
    mockAuthStore._user.value = { id: 1 };
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const items = wrapper.vm.items;
    const browseCourses = items.find(item => item.label === 'Browse Courses');
    const browseProblems = items.find(item => item.label === 'Browse Problems');
    const profile = items.find(item => item.label === 'Profile');

    expect(browseCourses.visible()).toBe(true);
    expect(browseProblems.visible()).toBe(true);
    expect(profile.visible()).toBe(true);
  });

  it('should show content creator items when user is content creator', () => {
    mockAuthStore._user.value = { id: 1, is_content_creator: true };
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const items = wrapper.vm.items;
    const myCourses = items.find(item => item.label === 'My Courses');
    const myProblems = items.find(item => item.label === 'My Problems');

    expect(myCourses).toBeTruthy();
    expect(myProblems).toBeTruthy();
    expect(myCourses.visible()).toBe(true);
    expect(myProblems.visible()).toBe(true);
  });

  it('should hide content creator items when user is not content creator', () => {
    mockAuthStore._user.value = { id: 1, is_content_creator: false };
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const items = wrapper.vm.items;
    const myCourses = items.find(item => item.label === 'My Courses');
    const myProblems = items.find(item => item.label === 'My Problems');

    expect(myCourses).toBeTruthy();
    expect(myProblems).toBeTruthy();
    expect(myCourses.visible()).toBe(false);
    expect(myProblems.visible()).toBe(false);
  });

  it('should show logout button when authenticated', () => {
    mockAuthStore._user.value = { id: 1 };
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const logoutButton = wrapper.find('button');
    expect(logoutButton.exists()).toBe(true);
    expect(logoutButton.text()).toContain('Logout');
  });

  it('should hide logout button when not authenticated', () => {
    mockAuthStore._user.value = null;
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const logoutButton = wrapper.find('button');
    expect(logoutButton.exists()).toBe(false);
  });

  it('should call logout when logout button is clicked', async () => {
    mockAuthStore._user.value = { id: 1 };
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();

    const logoutButton = wrapper.find('button');
    await logoutButton.trigger('click');

    expect(mockAuthStore.logout).toHaveBeenCalled();
  });

  it('should navigate to home when home item is clicked', async () => {
    mockAuthStore._user.value = null;
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();
    await router.isReady();
    const items = wrapper.vm.items;
    const homeItem = items.find(item => item.label === 'Home');

    await router.push({ name: 'login' });
    await nextTick();
    expect(router.currentRoute.value.name).toBe('login');

    homeItem.command();
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('should navigate to browse courses when item is clicked', async () => {
    mockAuthStore._user.value = { id: 1 };
    mockAuthStore._isReady.value = true;
    wrapper = createWrapper();
    await router.isReady();
    const items = wrapper.vm.items;
    const browseCoursesItem = items.find(item => item.label === 'Browse Courses');

    browseCoursesItem.command();
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(router.currentRoute.value.name).toBe('browse-courses');
  });

  it('should hide menu items when auth is not ready', async () => {
    mockAuthStore._user.value = null;
    mockAuthStore._isReady.value = false;
    wrapper = createWrapper();
    await nextTick();

    const items = wrapper.vm.items;
    const itemsWithVisibility = items.filter(item => item.visible);

    expect(itemsWithVisibility.length).toBeGreaterThan(0);

    itemsWithVisibility.forEach(item => {
      const result = item.visible();
      expect(result).toBe(false);
    });

    const homeItem = items.find(item => item.label === 'Home');
    expect(homeItem.visible).toBeUndefined();
  });
});


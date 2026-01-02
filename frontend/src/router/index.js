import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/Users/LoginView.vue';
import RegisterView from '../views/Users/RegisterView.vue';
import VerifyAccountView from '../views/Users/VerifyAccountView.vue';
import ResendVerificationView from '../views/Users/ResendVerificationView.vue';
import SendPasswordResetView from '../views/Users/SendPasswordResetView.vue';
import ResetPasswordView from '../views/Users/ResetPasswordView.vue';
import ProfileView from '../views/Users/ProfileView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import CreateCourseView from '../views/Courses/CreateCourseView.vue';
import CreateChapterView from '../views/Chapters/CreateChapterView.vue';
import CreateLessonView from '../views/Lessons/CreateLessonView.vue';
import CreateProblemView from '../views/Problems/CreateProblemView.vue';
import ProblemEditView from '../views/Problems/ProblemEditView.vue';
import ProblemView from '../views/Problems/ProblemView.vue';
import BrowseProblemsView from '../views/Problems/BrowseProblemsView.vue';
import MyProblemsView from '../views/Problems/MyProblemsView.vue';
import CourseChaptersView from '../views/Chapters/CourseChaptersView.vue';
import ChapterLessonsView from '../views/Lessons/ChapterLessonsView.vue';
import MyCoursesView from '../views/Courses/MyCoursesView.vue';
import CourseDetailView from '../views/Courses/CourseDetailView.vue';
import LessonDetailView from '../views/Lessons/LessonDetailView.vue';
import BrowseCoursesView from '../views/Courses/BrowseCoursesView.vue';
import CourseView from '../views/Courses/CourseView.vue';
import { useAuthStore } from '../store/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/browse-courses',
    name: 'browse-courses',
    component: BrowseCoursesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/browse-problems',
    name: 'browse-problems',
    component: BrowseProblemsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/courses/:courseId',
    name: 'course-view',
    component: CourseView,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true },
  },
  {
    path: '/verify-account/:user_id/:user_uuid/:token',
    name: 'verify-account',
    component: VerifyAccountView,
    meta: { guestOnly: true },
  },
  {
    path: '/resend-verification',
    name: 'resend-verification',
    component: ResendVerificationView,
    meta: { guestOnly: true },
  },
  {
    path: '/send-password-reset',
    name: 'send-password-reset',
    component: SendPasswordResetView,
    meta: { guestOnly: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reset-password/:user_id/:user_uuid/:token',
    name: 'reset-password',
    component: ResetPasswordView,
  },
  {
    path: '/create-course',
    name: 'create-course',
    component: CreateCourseView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/create-problem',
    name: 'create-problem',
    component: CreateProblemView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/my-problems',
    name: 'my-problems',
    component: MyProblemsView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/problems/:problemId/edit',
    name: 'edit-problem',
    component: ProblemEditView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/problems/:problemId',
    name: 'problem',
    component: ProblemView,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-courses',
    name: 'my-courses',
    component: MyCoursesView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/courses/:courseId/edit',
    name: 'course-detail',
    component: CourseDetailView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/courses/:courseId/chapters',
    name: 'course-chapters',
    component: CourseChaptersView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/courses/:courseId/chapters/new',
    name: 'create-chapter',
    component: CreateChapterView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/courses/:courseId/chapters/:chapterId/lessons',
    name: 'chapter-lessons',
    component: ChapterLessonsView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/courses/:courseId/chapters/:chapterId/lessons/new',
    name: 'create-lesson',
    component: CreateLessonView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/courses/:courseId/chapters/:chapterId/lessons/:lessonId',
    name: 'lesson-detail',
    component: LessonDetailView,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  // Ensure the user fetch attempt has completed before proceeding
  if (!authStore.isReady) {
    await authStore.fetchUser();
  }
  const isAuthenticated = authStore.isAuthenticated;
  const isCreator = authStore.user?.is_content_creator === true;

  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'home' });
  }

  if (to.meta.requiresCreator) {
    if (isAuthenticated && isCreator) {
      return next();
    } else {
      console.warn('Access denied: Creator permissions required.');
      return next({ name: 'home' });
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }

  next();
});

export default router;

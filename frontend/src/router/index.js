import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CreateCourseView from '../views/CreateCourseView.vue'
import CreateChapterView from '../views/CreateChapterView.vue'
import CreateLessonView from '../views/CreateLessonView.vue'
import CourseChaptersView from '../views/CourseChaptersView.vue'
import ChapterLessonsView from '../views/ChapterLessonsView.vue'
import MyCoursesView from '../views/MyCoursesView.vue'
import CourseDetailView from '../views/CourseDetailView.vue'
import LessonDetailView from '../views/LessonDetailView.vue'
import { useAuthStore } from '../store/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/create-course',
    name: 'create-course',
    component: CreateCourseView,
    meta: { requiresAuth: true, requiresCreator: true }
  },
  {
    path: '/my-courses',
    name: 'my-courses',
    component: MyCoursesView,
    meta: { requiresAuth: true, requiresCreator: true }
  },
  {
    path: '/courses/:courseId/edit',
    name: 'course-detail',
    component: CourseDetailView,
    meta: { requiresAuth: true, requiresCreator: true }
  },
  {
    path: '/courses/:courseId/chapters',
    name: 'course-chapters',
    component: CourseChaptersView,
    meta: { requiresAuth: true, requiresCreator: true }
  },
  {
    path: '/courses/:courseId/chapters/new',
    name: 'create-chapter',
    component: CreateChapterView,
    meta: { requiresAuth: true, requiresCreator: true }
  },
  {
    path: '/courses/:courseId/chapters/:chapterId/lessons',
    name: 'chapter-lessons',
    component: ChapterLessonsView,
    meta: { requiresAuth: true, requiresCreator: true }
  },
  {
    path: '/courses/:courseId/chapters/:chapterId/lessons/new',
    name: 'create-lesson',
    component: CreateLessonView,
    meta: { requiresAuth: true, requiresCreator: true }
  },
  {
    path: '/courses/:courseId/chapters/:chapterId/lessons/:lessonId',
    name: 'lesson-detail',
    component: LessonDetailView,
    meta: { requiresAuth: true, requiresCreator: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const isCreator = authStore.user?.is_content_creator === true

  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'home' })
  }

  if (to.meta.requiresCreator) {
    if (isAuthenticated && isCreator) {
      return next()
    } else {
      console.warn('Access denied: Creator permissions required.');
      return next({ name: 'home' })
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  next()
})

export default router


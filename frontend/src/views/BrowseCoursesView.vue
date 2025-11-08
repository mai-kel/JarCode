<template>
  <Card>
    <template #title>
      <h2>Browse Courses</h2>
    </template>
    <template #content>
      <div class="p-fluid">
        <div class="mb-4">
          <InputText
            type="text"
            v-model="searchQuery"
            @input="onSearchInput"
            placeholder="Search courses by title..."
            class="w-full"
          />
        </div>

        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
        </div>

        <div v-else class="grid">
          <div v-for="c in courses" :key="c.id" class="col-12 md:col-6 lg:col-4">
            <Card class="h-full">
              <template #header>
                <img :src="courseImage(c)" alt="Course thumbnail" class="w-full" style="height:180px;object-fit:cover" />
              </template>
              <template #title>
                <span class="ellipsis-1">{{ c.title }}</span>
              </template>
              <template #content>
                <p class="ellipsis-3">{{ c.description }}</p>
              </template>
              <template #footer>
                <div class="flex justify-content-end">
                  <Button label="View Course" icon="pi pi-eye" class="p-button-text" @click="viewCourse(c)" />
                </div>
              </template>
            </Card>
          </div>
          <div v-if="courses.length === 0" class="col-12 text-color-secondary p-3">No courses found.</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import courseService from '../services/courseService'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()
const route = useRoute()
const courses = ref([])
const searchQuery = ref('')
const loading = ref(true)
const error = ref(null)

const fetchCourses = async () => {
  try {
    loading.value = true
    const response = await courseService.getAllCourses(searchQuery.value)
    courses.value = response.data
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

let debounceTimer = null

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchCourses()
    debounceTimer = null
  }, 300)
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const viewCourse = (course) => {
  router.push({ name: 'course-view', params: { courseId: course.id } })
}

const courseImage = (course) => {
  if (course.thumbnail) {
    return course.thumbnail
  }
  return '/img/course-placeholder.svg'
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.ellipsis-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 1; }
.ellipsis-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 3; }
</style>

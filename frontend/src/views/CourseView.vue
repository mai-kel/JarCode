<template>
  <Card>
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <h2>{{ course ? course.title : 'Course' }}</h2>
        <Button label="Go back to courses" icon="pi pi-arrow-left" class="p-button-text" @click="goBackToCourses" />
      </div>
    </template>
    <template #subtitle>
      <div>
        Author: {{ course?.owner.first_name }} {{ course?.owner.last_name }}
      </div>
    </template>
    <template #content>
      <div class="p-fluid grid">
        <!-- Chapters and Lessons -->
        <div class="col-12 lg:col-3">
          <Card class="h-full">
            <template #title>
              <h3>Chapters & Lessons</h3>
            </template>
            <template #content>
              <div v-if="loading" class="flex justify-content-center py-4">
                <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
              </div>
              <div v-else-if="error" class="text-center text-red-500">Error: {{ error.message }}</div>
              <div v-else-if="!course || chapters.length === 0" class="text-color-secondary p-3">No chapters or lessons available.</div>
              <div v-else>
                <Accordion :activeIndex="0">
                  <AccordionTab v-for="(chapter, chapterIndex) in chapters" :key="chapter.id" :header="`${chapterIndex + 1}. ${chapter.title}`">
                    <ul class="list-none p-0 m-0">
                      <li v-for="(lesson, lessonIndex) in chapter.lessons" :key="lesson.id" class="mb-2">
                        <a
                          href="#"
                          @click.prevent="selectLesson(lesson)"
                          :class="{
                            'text-primary font-medium': selectedLesson && selectedLesson.id === lesson.id,
                            'text-color-secondary hover:text-primary': !selectedLesson || selectedLesson.id !== lesson.id
                          }"
                        >
                          {{ chapterIndex + 1 }}.{{ lessonIndex + 1 }}. {{ lesson.title }}
                        </a>
                      </li>
                    </ul>
                  </AccordionTab>
                </Accordion>
              </div>
            </template>
          </Card>
        </div>

        <!-- Lesson Content -->
        <div class="col-12 lg:col-9">
          <Card class="h-full">
            <template #title>
              <h3>{{ selectedLesson ? selectedLesson.title : (course ? course.title : 'Loading...') }}</h3>
            </template>
            <template #content>
              <div v-if="selectedLesson">
                <div class="prose max-w-none" v-html="sanitizedLessonContent"></div>
              </div>
              <div v-else-if="course">
                <img
                  :src="courseImage(course)"
                  alt="Course Thumbnail"
                  class="course-thumbnail rounded-md"
                />
                <p class="text-color-secondary">{{ course.description }}</p>
              </div>
              <div v-else class="flex justify-content-center py-4">
                <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import courseService from '../services/courseService'
import DOMPurify from 'dompurify'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()
const course = ref(null)
const chapters = ref([])
const selectedLesson = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchCourseDetails = async () => {
  try {
    loading.value = true
    const courseResponse = await courseService.getCourseDetail(route.params.courseId)
    course.value = courseResponse.data

    const chaptersResponse = await courseService.getChaptersForCourse(route.params.courseId)
    chapters.value = chaptersResponse.data

    for (const chapter of chapters.value) {
      const lessonsResponse = await courseService.getLessonsForChapter(route.params.courseId, chapter.id)
      chapter.lessons = lessonsResponse.data
    }
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}

const selectLesson = (lesson) => {
  selectedLesson.value = lesson
  nextTick(() => {
    if (window.Prism) {
      window.Prism.highlightAll()
    }
  })
}

const sanitizedLessonContent = computed(() => {
  if (selectedLesson.value && selectedLesson.value.content) {
    return DOMPurify.sanitize(selectedLesson.value.content)
  }
  return ''
})

const courseImage = (course) => {
  if (course.thumbnail) {
    return course.thumbnail
  }
  return '/img/course-placeholder.svg'
}

const goBackToCourses = () => {
  router.push({ name: 'browse-courses' })
}

onMounted(() => {
  fetchCourseDetails()
})

watch(selectedLesson, () => {
  nextTick(() => {
    if (window.Prism) {
      window.Prism.highlightAll()
    }
  })
})
</script>

<style scoped>
.course-thumbnail {
width: 100%;
max-width: 640px;
height: auto;
max-height: 360px;
display: block;
margin-bottom: 1rem;
background-color: #f5f5f5;
}
</style>

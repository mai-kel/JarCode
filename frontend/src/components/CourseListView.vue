<template>
  <Card>
    <template #title>
      <h2>{{ title }}</h2>
    </template>
    <template #content>
      <div class="p-fluid">
        <div class="mb-4">
          <InputText
            type="text"
            v-model="searchQuery"
            @input="onSearchInput"
            :placeholder="placeholder"
            class="w-full"
          />
        </div>

        <div v-if="showCreate || hasCreateSlot" class="flex align-items-center justify-content-between mb-3">
          <div>
            <slot name="create">
              <Button v-if="showCreate" label="Create Course" icon="pi pi-plus" @click="$emit('create')" />
            </slot>
          </div>
        </div>

        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
        </div>

        <div v-else class="grid">
          <div v-for="c in courses" :key="c.id" class="col-12 md:col-6 lg:col-3">
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
                  <slot name="item-action">
                    <Button :label="itemActionLabel" :icon="itemActionIcon" class="p-button-text" @click="itemAction && itemAction(c)" />
                  </slot>
                </div>
              </template>
            </Card>
          </div>
          <div v-if="courses.length === 0" class="col-12 text-color-secondary p-3">{{ emptyMessage }}</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps({
  title: { type: String, default: 'Courses' },
  fetcher: { type: Function, required: true },
  itemAction: { type: Function, default: null },
  itemActionLabel: { type: String, default: 'View' },
  itemActionIcon: { type: String, default: 'pi pi-eye' },
  placeholder: { type: String, default: 'Search courses by title...' },
  emptyMessage: { type: String, default: 'No courses found.' },
  showCreate: { type: Boolean, default: false }
})

const emit = defineEmits(['create'])

const courses = ref([])
const searchQuery = ref('')
const loading = ref(true)
let debounceTimer = null

const hasCreateSlot = !!(false)

const normalizeResult = (res) => {
  if (!res) return []
  if (res.data !== undefined) return res.data
  return res
}

const fetchCourses = async () => {
  loading.value = true
  try {
    const res = await props.fetcher(searchQuery.value)
    courses.value = normalizeResult(res) || []
  } catch (e) {
    courses.value = []
  } finally {
    loading.value = false
  }
}

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

const courseImage = (course) => {
  if (course.thumbnail) return course.thumbnail
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

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
              <template #subtitle>
                {{ c.owner.first_name }} {{ c.owner.last_name }}
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
          <div v-if="loadingMore" class="col-12 flex justify-content-center py-3">
            <ProgressSpinner style="width:30px;height:30px" strokeWidth="4"/>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
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
const loadingMore = ref(false)
const nextCursor = ref(null)
const autoLoading = ref(false)
let debounceTimer = null

const hasCreateSlot = !!(false)

const normalizePage = (res) => {
  if (!res) return { results: [], next: null }
  if (Array.isArray(res)) return { results: res, next: null }
  if (res.results !== undefined) return { results: res.results || [], next: extractCursor(res.next) }
  if (res.data !== undefined) {
    if (Array.isArray(res.data)) return { results: res.data, next: null }
    if (res.data.results !== undefined) return { results: res.data.results || [], next: extractCursor(res.data.next) }
  }
  return { results: [], next: null }
}

const extractCursor = (nextUrl) => {
  if (!nextUrl) return null
  try {
    const u = new URL(nextUrl)
    return u.searchParams.get('cursor')
  } catch (e) {
    const m = nextUrl.match(/[?&]cursor=([^&]+)/)
    return m ? decodeURIComponent(m[1]) : null
  }
}

const fetchPage = async (cursor = null, append = false) => {
  if (append) loadingMore.value = true
  else loading.value = true
  try {
    const res = await props.fetcher(searchQuery.value, cursor)
    const page = normalizePage(res)
    nextCursor.value = page.next
    if (append) courses.value = courses.value.concat(page.results || [])
    else courses.value = page.results || []
  } catch (e) {
    if (!append) courses.value = []
  } finally {
    loadingMore.value = false
    loading.value = false
  }
}

const fillIfNoScroll = async () => {
  if (autoLoading.value) return
  if (!nextCursor.value) return
  autoLoading.value = true
  try {
    while (nextCursor.value) {
      await nextTick()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const winH = window.innerHeight || document.documentElement.clientHeight
      const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
      if (docH - (scrollTop + winH) >= 200) break
      await fetchPage(nextCursor.value, true)
    }
  } finally {
    autoLoading.value = false
  }
}

const onSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    nextCursor.value = null
    courses.value = []
    await fetchPage(null, false)
    await fillIfNoScroll()
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

const onScroll = async () => {
  if (!nextCursor.value) return
  if (loadingMore.value || loading.value) return
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const winH = window.innerHeight || document.documentElement.clientHeight
  const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  if (docH - (scrollTop + winH) < 200) {
    await fetchPage(nextCursor.value, true)
  }
}

onMounted(async () => {
  await fetchPage()
  await fillIfNoScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
</script>

<style scoped>
.ellipsis-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 1; }
.ellipsis-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 3; }
</style>

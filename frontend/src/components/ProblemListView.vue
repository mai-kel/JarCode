<template>
  <Card>
    <template #title>
      <h2>{{ title }}</h2>
    </template>

    <template #content>
      <div class="p-fluid">
        <div class="grid mb-3">
          <div class="col-12 md:col-6">
            <InputText type="text" v-model="searchQuery" @input="onSearchInput" :placeholder="placeholder" class="w-full" />
          </div>
          <div class="col-6 md:col-3">
            <Dropdown :options="languageOptions" optionLabel="text" optionValue="value" v-model="languageFilter" placeholder="Language" />
          </div>
          <div class="col-6 md:col-3">
            <Dropdown :options="difficultyOptions" optionLabel="text" optionValue="value" v-model="difficultyFilter" placeholder="Difficulty" />
          </div>
        </div>

        <div v-if="showCreate || hasCreateSlot" class="flex align-items-center justify-content-between mb-3">
          <div>
            <slot name="create">
              <Button v-if="showCreate" label="Create Problem" icon="pi pi-plus" @click="$emit('create')" />
            </slot>
          </div>
        </div>

        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width:50px;height:50px" strokeWidth="6"/>
        </div>

        <div v-else>
          <ul class="list-none p-0 m-0">
            <li v-for="p in problems" :key="p.id" class="py-3 border-bottom flex align-items-center justify-content-between">
              <div class="flex flex-column">
                <span class="font-medium">{{ p.title }}</span>
                <small class="text-color-secondary">{{ difficultyText(p.difficulty) }} • {{ languageText(p.language) }}</small>
              </div>
              <div class="flex align-items-center">
                <slot name="item-action">
                  <Button v-if="showItemButtons" class="p-button-text mr-2" label="Edit" icon="pi pi-pencil" @click="onEdit(p)" />
                  <Button v-if="!showItemButtons" class="p-button-text" label="View" icon="pi pi-eye" @click="onView(p)" />
                </slot>
              </div>
            </li>
          </ul>

          <div v-if="loadingMore" class="flex justify-content-center py-3">
            <ProgressSpinner style="width:30px;height:30px" strokeWidth="4"/>
          </div>

          <div v-if="problems.length === 0" class="text-color-secondary p-3">{{ emptyMessage }}</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import { Languages, Difficulties } from '../constants/problems'

const props = defineProps({
  title: { type: String, default: 'Problems' },
  fetcher: { type: Function, required: true },
  placeholder: { type: String, default: 'Search problems by title...' },
  emptyMessage: { type: String, default: 'No problems found.' },
  showCreate: { type: Boolean, default: false },
  showItemButtons: { type: Boolean, default: false }
})

const emit = defineEmits(['create','view','edit','item-click'])

const problems = ref([])
const searchQuery = ref('')
const languageFilter = ref(null)
const difficultyFilter = ref(null)
const loading = ref(true)
const loadingMore = ref(false)
const nextCursor = ref(null)
const autoLoading = ref(false)
let debounceTimer = null

const languageOptions = computed(() => [{ text: 'All', value: null }, ...Languages])
const difficultyOptions = computed(() => [{ text: 'All', value: null }, ...Difficulties])

const hasCreateSlot = !!(false)

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

const normalizePage = (res) => {
  if (!res) return { results: [], next: null }
  if (Array.isArray(res)) return { results: res, next: null }
  if (res.results !== undefined) {
    return { results: res.results || [], next: extractCursor(res.next) }
  }
  if (res.data !== undefined) {
    if (Array.isArray(res.data)) return { results: res.data, next: null }
    if (res.data.results !== undefined) return { results: res.data.results || [], next: extractCursor(res.data.next) }
  }
  return { results: [], next: null }
}

const fetchPage = async (cursor = null, append = false) => {
  if (append) loadingMore.value = true
  else loading.value = true
  try {
    const res = await props.fetcher({
      search: searchQuery.value,
      language: languageFilter.value,
      difficulty: difficultyFilter.value,
      cursor
    })

    const page = normalizePage(res)
    nextCursor.value = page.next
    if (append) {
      problems.value = problems.value.concat(page.results || [])
    } else {
      problems.value = page.results || []
    }
  } catch (e) {
    if (!append) problems.value = []
  } finally {
    loadingMore.value = false
    loading.value = false
  }
}

const onSearchInput = () => {
  scheduleFetch()
}

const scheduleFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    nextCursor.value = null
    problems.value = []
    await fetchPage(null, false)
    await fillIfNoScroll()
    debounceTimer = null
  }, 300)
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

watch([languageFilter, difficultyFilter], () => {
  scheduleFetch()
})

const onEdit = (p) => emit('edit', p)
const onView = (p) => emit('view', p)

const difficultyText = (val) => {
  if (val === null || val === undefined) return 'All'
  const found = difficultyOptions.value.find(d => d.value === val)
  return found ? found.text : val
}

const languageText = (val) => {
  if (val === null || val === undefined) return 'All'
  const found = languageOptions.value.find(l => l.value === val)
  return found ? found.text : val
}

const onScroll = () => {
  if (!nextCursor.value) return
  if (loadingMore.value || loading.value) return
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const winH = window.innerHeight || document.documentElement.clientHeight
  const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  if (docH - (scrollTop + winH) < 200) {
    fetchPage(nextCursor.value, true)
  }
}

onMounted(async () => {
  await fetchPage()
  await fillIfNoScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.border-bottom { border-bottom: 1px solid var(--surface-border); }
.list-none { list-style: none; }
</style>

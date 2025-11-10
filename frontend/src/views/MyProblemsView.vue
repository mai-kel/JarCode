<template>
  <ProblemListView
    title="My Problems"
    :fetcher="fetcher"
    :placeholder="'Search your problems...'"
    :showCreate="true"
    :showItemButtons="true"
    @create="onCreate"
    @edit="onEdit"
    @view="onView"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import ProblemListView from '../components/ProblemListView.vue'
import { listProblems } from '../services/problemService'
import { useAuthStore } from '../store/auth'

const router = useRouter()

const authStore = useAuthStore()

const fetcher = async (filters) => {
  const author = authStore.user?.id || null
  return await listProblems({ ...filters, author })
}

const onCreate = () => router.push({ name: 'create-problem' })
const onEdit = (p) => router.push({ name: 'edit-problem', params: { problemId: p.id } })
const onView = (p) => router.push({ name: 'home' })
</script>

<style scoped>
</style>

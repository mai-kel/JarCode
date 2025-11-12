<template>
  <ProblemListView
    title="Browse Problems"
    :fetcher="fetcher"
    :placeholder="'Search problems by title...'"
    :showCreate="false"
    @view="onView"
    @item-click="onView"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import ProblemListView from '../components/ProblemListView.vue'
import { listProblems } from '../services/problemService'

const router = useRouter()

const fetcher = async (filters) => {
  return await listProblems(filters)
}

const onView = (p) => {
  router.push({ name: 'problem', params: { problemId: p.id } })
}
</script>

<style scoped>
</style>

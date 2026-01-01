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
import { useRouter } from 'vue-router';
import ProblemListView from '../../components/ProblemListView.vue';
import { useProblemStore } from '../../store/problem';

const router = useRouter();
const problemStore = useProblemStore();

const fetcher = async (filters) => {
  return await problemStore.listProblems(filters);
};

const onView = (p) => {
  router.push({ name: 'problem', params: { problemId: p.id } });
};
</script>

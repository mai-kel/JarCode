<template>
  <Card>
    <template #title>
      <h2>{{ title }}</h2>
    </template>

    <template #content>
      <div class="p-fluid">
        <div class="grid mb-3">
          <div class="col-12 md:col-6">
            <InputText
              v-model="searchQuery"
              type="text"
              :placeholder="placeholder"
              class="w-full"
              @input="onSearchInput"
            />
          </div>
          <div class="col-6 md:col-2">
            <Dropdown
              v-model="languageFilter"
              :options="languageOptions"
              option-label="text"
              option-value="value"
              placeholder="Language"
            />
          </div>
          <div class="col-6 md:col-2">
            <Dropdown
              v-model="difficultyFilter"
              :options="difficultyOptions"
              option-label="text"
              option-value="value"
              placeholder="Difficulty"
            />
          </div>
          <div class="col-12 md:col-2">
            <Dropdown
              v-model="isSolvedFilter"
              :options="isSolvedOptions"
              option-label="text"
              option-value="value"
              placeholder="Status"
            />
          </div>
        </div>

        <div v-if="showCreate" class="flex align-items-center justify-content-between mb-3">
          <div>
            <slot name="create">
              <Button
                v-if="showCreate"
                label="Create Problem"
                icon="pi pi-plus"
                @click="$emit('create')"
              />
            </slot>
          </div>
        </div>

        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width: 50px; height: 50px" stroke-width="6" />
        </div>

        <div v-else>
          <ul class="list-none p-0 m-0">
            <li
              v-for="p in problems"
              :key="p.id"
              class="py-3 border-bottom flex align-items-center justify-content-between"
            >
              <div class="flex align-items-center">
                <span
                  v-if="p.is_solved"
                  class="flex align-items-center"
                  style="margin-right: 0.75rem; font-size: 1.1rem; color: #28a745"
                >
                  <i class="pi pi-check"></i>
                </span>
                <span
                  v-else
                  style="display: inline-block; width: 1.1rem; margin-right: 0.75rem"
                ></span>
                <div class="flex flex-column">
                  <span class="font-medium">{{ p.title }}</span>
                  <small class="text-color-secondary"
                    >{{ difficultyText(p.difficulty) }} • {{ languageText(p.language) }}</small
                  >
                </div>
              </div>
              <div class="flex align-items-center">
                <slot name="item-action">
                  <Button
                    v-if="showItemButtons"
                    class="p-button-text mr-2"
                    label="Edit"
                    icon="pi pi-pencil"
                    @click="onEdit(p)"
                  />
                  <Button
                    v-if="!showItemButtons"
                    class="p-button-text"
                    label="View"
                    icon="pi pi-eye"
                    @click="onView(p)"
                  />
                </slot>
              </div>
            </li>
          </ul>

          <div v-if="loadingMore" class="flex justify-content-center py-3">
            <ProgressSpinner style="width: 30px; height: 30px" stroke-width="4" />
          </div>

          <div v-if="problems.length === 0" class="text-color-secondary p-3">
            {{ emptyMessage }}
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import { Languages, Difficulties } from '../constants/problems';
import { useCursorPagination } from '../composables/useCursorPagination';
import { useInfiniteScroll } from '../composables/useInfiniteScroll';
import { useDebounce } from '../composables/useDebounce';

const props = defineProps({
  title: { type: String, default: 'Problems' },
  fetcher: { type: Function, required: true },
  placeholder: { type: String, default: 'Search problems by title...' },
  emptyMessage: { type: String, default: 'No problems found.' },
  showCreate: { type: Boolean, default: false },
  showItemButtons: { type: Boolean, default: false },
});

const emit = defineEmits(['create', 'view', 'edit', 'item-click']);

const searchQuery = ref('');
const languageFilter = ref(null);
const difficultyFilter = ref(null);
const isSolvedFilter = ref(null);

const languageOptions = computed(() => [{ text: 'All', value: null }, ...Languages]);
const difficultyOptions = computed(() => [{ text: 'All', value: null }, ...Difficulties]);
const isSolvedOptions = computed(() => [
  { text: 'All', value: null },
  { text: 'Solved', value: true },
  { text: 'Unsolved', value: false },
]);

const pagination = useCursorPagination(
  (cursor) =>
    props.fetcher({
      search: searchQuery.value,
      language: languageFilter.value,
      difficulty: difficultyFilter.value,
      is_solved: isSolvedFilter.value,
      cursor,
    }),
  { initialLoad: true }
);

const problems = computed(() => pagination.items.value);
const loading = computed(() => pagination.loading.value);
const loadingMore = computed(() => pagination.loadingMore.value);

const { debouncedFunction: debouncedRefresh } = useDebounce(async () => {
  await pagination.refresh();
  infiniteScroll.fillIfNoScroll();
}, 300);

const scheduleFetch = () => {
  debouncedRefresh();
};

const onSearchInput = () => {
  scheduleFetch();
};

const infiniteScroll = useInfiniteScroll({
  hasNext: pagination.hasNext,
  loading: pagination.loading,
  loadingMore: pagination.loadingMore,
  onLoadMore: pagination.loadMore,
  threshold: 200,
  autoFill: true,
  autoFillOnce: false,
});

watch([languageFilter, difficultyFilter, isSolvedFilter], () => {
  scheduleFetch();
});

const onEdit = (p) => emit('edit', p);
const onView = (p) => emit('view', p);

const difficultyText = (val) => {
  if (val === null || val === undefined) return 'All';
  const found = difficultyOptions.value.find((d) => d.value === val);
  return found ? found.text : val;
};

const languageText = (val) => {
  if (val === null || val === undefined) return 'All';
  const found = languageOptions.value.find((l) => l.value === val);
  return found ? found.text : val;
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--surface-border);
}
.list-none {
  list-style: none;
}
</style>

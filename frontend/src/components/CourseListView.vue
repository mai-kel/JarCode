<template>
  <Card>
    <template #title>
      <h2>{{ title }}</h2>
    </template>
    <template #content>
      <div class="p-fluid">
        <div class="mb-4">
          <InputText
            v-model="searchQuery"
            type="text"
            :placeholder="placeholder"
            class="w-full"
            @input="onSearchInput"
          />
        </div>

        <div v-if="showCreate" class="flex align-items-center justify-content-between mb-3">
          <div>
            <slot name="create">
              <Button
                v-if="showCreate"
                label="Create Course"
                icon="pi pi-plus"
                @click="$emit('create')"
              />
            </slot>
          </div>
        </div>

        <div v-if="loading" class="flex justify-content-center py-4">
          <ProgressSpinner style="width: 50px; height: 50px" stroke-width="6" />
        </div>

        <div v-else class="grid">
          <div v-for="c in courses" :key="c.id" class="col-12 md:col-6 lg:col-3">
            <Card class="h-full">
              <template #header>
                <img
                  :src="courseImage(c)"
                  alt="Course thumbnail"
                  class="w-full"
                  style="height: 180px; object-fit: cover"
                />
              </template>
              <template #title>
                <span class="ellipsis-1">{{ c.title }}</span>
              </template>
              <template #subtitle> {{ c.owner.first_name }} {{ c.owner.last_name }} </template>
              <template #content>
                <p class="ellipsis-3">{{ c.description }}</p>
              </template>
              <template #footer>
                <div class="flex justify-content-end">
                  <slot name="item-action">
                    <Button
                      :label="itemActionLabel"
                      :icon="itemActionIcon"
                      class="p-button-text"
                      @click="itemAction && itemAction(c)"
                    />
                  </slot>
                </div>
              </template>
            </Card>
          </div>
          <div v-if="courses.length === 0" class="col-12 text-color-secondary p-3">
            {{ emptyMessage }}
          </div>
          <div v-if="loadingMore" class="col-12 flex justify-content-center py-3">
            <ProgressSpinner style="width: 30px; height: 30px" stroke-width="4" />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import { useCursorPagination } from '../composables/useCursorPagination';
import { useInfiniteScroll } from '../composables/useInfiniteScroll';
import { useDebounce } from '../composables/useDebounce';

const props = defineProps({
  title: { type: String, default: 'Courses' },
  fetcher: { type: Function, required: true },
  itemAction: { type: Function, default: null },
  itemActionLabel: { type: String, default: 'View' },
  itemActionIcon: { type: String, default: 'pi pi-eye' },
  placeholder: { type: String, default: 'Search courses by title...' },
  emptyMessage: { type: String, default: 'No courses found.' },
  showCreate: { type: Boolean, default: false },
});

defineEmits(['create']);

const searchQuery = ref('');

const pagination = useCursorPagination((cursor) => props.fetcher(searchQuery.value, cursor), {
  initialLoad: true,
});

const courses = computed(() => pagination.items.value);
const loading = computed(() => pagination.loading.value);
const loadingMore = computed(() => pagination.loadingMore.value);

const { debouncedFunction: debouncedSearch } = useDebounce(async () => {
  await pagination.refresh();
  infiniteScroll.fillIfNoScroll();
}, 300);

const onSearchInput = () => {
  debouncedSearch();
};

const infiniteScroll = useInfiniteScroll({
  hasNext: pagination.hasNext,
  loading: pagination.loading,
  loadingMore: pagination.loadingMore,
  onLoadMore: pagination.loadMore,
  threshold: 200,
  autoFill: true,
});

const courseImage = (course) => {
  if (course.thumbnail) return course.thumbnail;
  return '/img/course-placeholder.svg';
};
</script>

<style scoped>
.ellipsis-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
}
.ellipsis-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}
</style>

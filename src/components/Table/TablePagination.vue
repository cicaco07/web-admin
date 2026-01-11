<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  pageSizeOptions?: number[];
}>();

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void;
  (e: 'update:itemsPerPage', value: number): void;
}>();

const pageSizes = computed(() => props.pageSizeOptions || [10, 25, 50]);
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return end > props.totalItems ? props.totalItems : end;
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) pages.push(i);
    
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page);
  }
};

const changePageSize = (size: number) => {
  emit('update:itemsPerPage', size);
  emit('update:currentPage', 1);
};
</script>

<template>
  <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
    <div class="d-flex align-items-center gap-2">
      <span class="text-muted">Tampilkan</span>
      <select
        class="form-select form-select-sm"
        style="width: auto;"
        :value="itemsPerPage"
        @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
      </select>
      <span class="text-muted">data</span>
    </div>

    <div class="text-muted">
      Menampilkan {{ startItem }} - {{ endItem }} dari {{ totalItems }} data
    </div>

    <nav aria-label="Table pagination">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
            <i class="ti ti-chevron-left"></i>
          </a>
        </li>
        <li
          v-for="(page, index) in visiblePages"
          :key="index"
          class="page-item"
          :class="{ active: page === currentPage, disabled: page === '...' }"
        >
          <a
            class="page-link"
            href="#"
            @click.prevent="typeof page === 'number' && goToPage(page)"
          >
            {{ page }}
          </a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
            <i class="ti ti-chevron-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

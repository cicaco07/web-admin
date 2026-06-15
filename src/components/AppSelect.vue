<script setup lang="ts">
import { computed } from 'vue';
import Select2 from 'vue3-select2-component';

export interface SelectOption {
  id: string | number;
  text: string;
}

const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchThreshold?: number;
  allowClear?: boolean;
}>(), {
  modelValue: null,
  placeholder: '',
  disabled: false,
  searchThreshold: 4,
  allowClear: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void;
  (e: 'change', value: string | number | null): void;
}>();

const select2Settings = computed(() => {
  const settings: Record<string, unknown> = {};

  if (props.options.length <= props.searchThreshold) {
    settings.minimumResultsForSearch = Infinity;
  }

  if (props.allowClear) {
    settings.allowClear = true;
  }

  return settings;
});

function onSelect(event: { id: string | number; text: string }) {
  const value = event.id;
  emit('update:modelValue', value);
  emit('change', value);
}
</script>

<template>
  <Select2
    class="app-select"
    :model-value="modelValue != null ? String(modelValue) : ''"
    :options="options"
    :placeholder="placeholder"
    :disabled="disabled"
    :settings="select2Settings"
    @select="onSelect"
  />
</template>

<style scoped>
.app-select :deep(.select2-container) {
  width: 100% !important;
}

.app-select :deep(.select2-container .select2-selection--single) {
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.app-select :deep(.select2-container--default .select2-selection--single .select2-selection__rendered) {
  line-height: 1.5;
  padding-left: 0;
  color: #212529;
}

.app-select :deep(.select2-container--default .select2-selection--single .select2-selection__arrow) {
  height: calc(1.5em + 0.75rem);
  top: 1px;
}

.app-select :deep(.select2-container--default .select2-selection--single .select2-selection__placeholder) {
  color: #6c757d;
}

.app-select :deep(.select2-container--default.select2-container--focus .select2-selection--single) {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.app-select :deep(.select2-container--default.select2-container--disabled .select2-selection--single) {
  background-color: #e9ecef;
  opacity: 1;
}
</style>

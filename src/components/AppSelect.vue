<script setup lang="ts">
import { computed } from 'vue';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

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

const filterable = computed(() => props.options.length > props.searchThreshold);

const selected = computed(() =>
  props.options.find(o => String(o.id) === String(props.modelValue)) ?? null
);

function onInput(option: SelectOption | null) {
  if (!option) {
    emit('update:modelValue', null);
    emit('change', null);
  } else {
    emit('update:modelValue', option.id);
    emit('change', option.id);
  }
}
</script>

<template>
  <vSelect
    class="app-select"
    :model-value="selected"
    :options="options"
    :placeholder="placeholder"
    :disabled="disabled"
    :filterable="filterable"
    :clearable="allowClear"
    :searchable="filterable"
    label="text"
    :reduce="(opt: SelectOption) => opt"
    :get-option-key="(opt: SelectOption) => opt.id"
    @update:modelValue="onInput"
  >
    <template #open-indicator="{ attributes }">
      <span v-bind="attributes" class="app-select__arrow"></span>
    </template>
  </vSelect>
</template>

<style>
:root {
  --vs-controls-color: #5a6a85;
  --vs-border-color: #dfe5ef;
  --vs-border-width: 1px;
  --vs-border-radius: 7px;

  --vs-dropdown-bg: #fff;
  --vs-dropdown-color: #5a6a85;
  --vs-dropdown-option-padding: 8px 16px;

  --vs-selected-color: #5a6a85;
  --vs-selected-bg: transparent;

  --vs-search-input-color: #5a6a85;
  --vs-search-input-placeholder-color: #a1aab2;

  --vs-font-size: 0.875rem;
  --vs-line-height: 1.5;

  --vs-state-disabled-bg: var(--bs-secondary-bg, #eaeff4);
  --vs-state-disabled-color: #5a6a85;

  --vs-dropdown-option--active-bg: #5d87ff;
  --vs-dropdown-option--active-color: #fff;
}
</style>

<style scoped>
.app-select {
  font-size: 0.875rem;
  font-weight: 400;
}

.app-select :deep(.vs__dropdown-toggle) {
  min-height: 42px;
  padding: 0 16px;
  border: var(--bs-border-width, 1px) solid #dfe5ef;
  border-radius: 7px;
  background-color: transparent;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.app-select :deep(.vs__selected-options) {
  padding: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

.app-select :deep(.vs__selected) {
  margin: 0;
  padding: 8px 0;
  border: none;
  line-height: 1.5;
  color: #5a6a85;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  position: relative;
}

.app-select :deep(.vs__search) {
  margin: 0;
  padding: 8px 0;
  line-height: 1.5;
  font-size: 0.875rem;
  color: #5a6a85;
  border: none;
}

.app-select :deep(.vs__search::placeholder) {
  color: #a1aab2;
}

.app-select :deep(.vs--single.vs--searching .vs__selected) {
  position: absolute;
  opacity: 0.4;
}

.app-select :deep(.vs__actions) {
  padding: 0;
  cursor: pointer;
}

.app-select__arrow {
  display: block;
  width: 16px;
  height: 12px;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-size: 16px 12px;
  background-position: center;
  transition: transform 0.15s ease;
}

.app-select :deep(.vs--open .app-select__arrow) {
  transform: rotate(180deg);
}

.app-select :deep(.vs--open .vs__dropdown-toggle) {
  border-color: #aec3ff;
  box-shadow: 0 0 0 0.25rem rgba(93, 135, 255, 0.25);
  border-bottom-color: #aec3ff;
}

.app-select :deep(.vs__dropdown-menu) {
  border: 1px solid #dfe5ef;
  border-radius: 7px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  margin-top: 4px;
  max-height: 250px;
}

.app-select :deep(.vs__dropdown-option) {
  padding: 8px 16px;
  font-size: 0.875rem;
  color: #5a6a85;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-select :deep(.vs__dropdown-option--highlight) {
  background: #5d87ff;
  color: #fff;
}

.app-select :deep(.vs__dropdown-option--selected) {
  font-weight: 600;
}

.app-select :deep(.vs__no-options) {
  padding: 8px 16px;
  font-size: 0.875rem;
  color: #a1aab2;
  text-align: center;
}

.app-select :deep(.vs--disabled .vs__dropdown-toggle) {
  background-color: var(--bs-secondary-bg, #eaeff4);
  opacity: 1;
  cursor: not-allowed;
}

.app-select :deep(.vs--disabled .vs__search) {
  background-color: transparent;
}

.app-select :deep(.vs--disabled .vs__selected) {
  color: #5a6a85;
}

.app-select :deep(.vs--disabled .vs__actions) {
  cursor: not-allowed;
}

.app-select :deep(.vs__clear) {
  display: flex;
  align-items: center;
  margin-right: 4px;
  color: #5a6a85;
}

.app-select :deep(.vs__clear:hover) {
  color: #e74c3c;
}

.app-select :deep(.vs__spinner) {
  border-left-color: #5d87ff;
}
</style>

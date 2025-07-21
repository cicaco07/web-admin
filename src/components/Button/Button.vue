<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type?: 'button' | 'submit' | 'reset',
  variant?: string,
  size?: string,
  disabled?: boolean,
  class?: string,
  loading?: boolean,
  onClick?: (e: MouseEvent) => void
}>();

const computedClass = computed(() => {
  let classes = ['btn'];
  if (props.variant) classes.push(`btn-${props.variant}`);
  if (props.size) classes.push(`btn-${props.size}`);
  if (props.class) classes.push(props.class);
  return classes.join(' ');
});

function handleClick(e: MouseEvent) {
  if (!props.loading && !props.disabled) {
    props.onClick?.(e);
  }
}
</script>

<template>
  <button
    :type="props.type || 'button'"
    :class="computedClass"
    :disabled="props.disabled || props.loading"
    @click="handleClick"
  >
    <template v-if="props.loading">
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span class="ms-2">Loading...</span>
    </template>
    <template v-else>
      <slot>Simpan</slot>
    </template>
  </button>
</template>

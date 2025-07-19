<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type?: 'button' | 'submit' | 'reset',
  variant?: string,
  size?: string,
  disabled?: boolean,
  class?: string,
  onClick?: (e: MouseEvent) => void
}>();
const computedClass = computed(() => {
  let classes = ['btn'];
  if (props.variant) classes.push(`btn-${props.variant}`);
  if (props.size) classes.push(`btn-${props.size}`);
  if (props.class) classes.push(props.class);
  return classes.join(' ');
});
</script>

<template>
  <button
    :type="type"
    :class="computedClass"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>
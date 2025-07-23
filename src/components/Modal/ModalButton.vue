<script setup lang="ts">

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'light-warning',
  text?: string,
  font: string,
  size?: 'sm' | 'md' |'lg',
  dataBsTarget?: string,
  onClick?: (e: MouseEvent) => void
}>();
</script>

<template>
  <button
    :class="['btn', `btn-${props.variant || 'primary'}`, `text-${props.text || ''}`, props.size ? `btn-${props.size}` : '', 'btn-custom', `font-${props.font || ''}`, 'me-1 m-t-10 mb-2 px-3 fs-3']"
    @click="props.onClick"
    data-bs-toggle="modal"
    :data-bs-target="`#${props.dataBsTarget}`"
  >
    <slot />
  </button>
</template>
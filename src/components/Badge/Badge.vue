<script setup lang="ts">

const props = defineProps<{
  color?: 'danger' | 'primary' | 'success' | 'info' | 'warning',
  class?: string
}>();
</script>

<template>
  <span :class="`badge bg-${props.color ?? 'primary'} me-1 ${props.class ?? ''}`">
    <slot />
  </span>
</template>
<script setup lang="ts">

const props = defineProps<{
  color?: 'danger' | 'primary' | 'success' | 'info' | 'warning' | 'secondary' | 'light' | 'dark',
  class?: string
}>();
</script>

<template>
  <span :class="`badge bg-${props.color ?? 'primary'} ${props.class ?? ''}`">
    <slot />
  </span>
</template>
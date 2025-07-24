<script setup lang="ts">

const props = defineProps<{
  id?: string,
  size?: 'sm' | 'md' | 'lg' | 'xl',
}>();
</script>

<template>
  <div 
    class="modal fade"
    :id="props.id || 'defaultModal'"
    tabindex="-1"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    aria-labelledby="bs-example-modal-lg"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-scrollable" :class="`modal-${props.size || 'lg'}`">
      <div class="modal-content">
        <slot/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  backgroundColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark',
}>();
</script>

<template>
  <div class="modal-header d-flex align-items-center modal-colored-header" :class="`bg-${props.backgroundColor || 'primary'}`">
    <h4 class="modal-title" id="myLargeModalLabel1">
      <slot />
    </h4>
  <button
  type="button"
    class="btn-close"
    data-bs-dismiss="modal"
    aria-label="Close"
    ></button>
  </div>
</template>
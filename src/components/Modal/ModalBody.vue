<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  onSubmit?: (payload: Event) => void,
}>();
</script>

<template>
  <div class="modal-body text-start">
    <form class="form-horizontal form-material" 
    @submit.prevent="props.onSubmit">
      <div class="card-body p-2">
        <slot />
      </div>
    </form>
  </div>
</template>
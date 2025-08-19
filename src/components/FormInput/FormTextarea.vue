<script setup lang="ts">

const props = defineProps<{
  label: string,
  modelValue: string,
  rows?: number,
  placeholder?: string,
  required?: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();
</script>

<template>
  <div class="mb-3">
    <label class="form-label">
      {{ props.label }}
      <span v-if="props.required" class="text-danger">*</span>
    </label>
    <textarea
      class="form-control"
      :rows="props.rows ?? 5"
      :placeholder="props.placeholder ?? `Masukkan ${props.label}`"
      :value="props.modelValue"
      :required="props.required ?? false"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </div>
</template>
<script setup lang="ts">

const props = defineProps<{
  type: 'text' | 'number' | 'range' | 'date' | 'file',
  label: string,
  modelValue: string | number | null,
  required?: boolean // opsional
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
    <input
      :type="props.type"
      class="form-control"
      :placeholder="`Masukkan ${props.label}`"
      :min="props.type === 'number' ? 0 : undefined"
      :step="props.type === 'number' ? 1 : undefined"
      :value="props.modelValue"
      :required="props.required ?? false"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement)?.value ?? '')"
    />
    <div v-if="props.type === 'file'" class="form-text">
      Upload an icon for the battle spell (JPEG, PNG, GIF, WebP) - Max size: 5MB
    </div>
  </div>
</template>
<script setup lang="ts">

const props = defineProps<{
  type: 'text' | 'number' | 'range' | 'date',
  label: string,
  modelValue: string,
  required?: boolean // opsional
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();
</script>

<template>
  <div class="mb-3">
    <label class="control-label">{{ props.label }}</label>
    <input
      :type="props.type"
      class="form-control"
      :placeholder="`Masukkan ${props.label}`"
      :value="props.modelValue"
      :required="props.required ?? false"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement)?.value ?? '')"
    />
  </div>
</template>
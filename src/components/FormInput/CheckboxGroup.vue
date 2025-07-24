<script setup lang="ts">

const props = defineProps<{
  options: string[],
  modelValue: string[],
  label?: string,
  max?: number
  column?: number
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>();

function handleChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  let checked = (e.target as HTMLInputElement).checked;
  let arr = [...props.modelValue];
  if (checked) {
    if (!arr.includes(value) && (!props.max || arr.length < props.max)) {
      arr.push(value);
    } else if (props.max && arr.length >= props.max) {
      (e.target as HTMLInputElement).checked = false;
    }
  } else {
    arr = arr.filter(v => v !== value);
  }
  emit('update:modelValue', arr);
}
</script>

<template>
  <div class="mb-3">
    <label v-if="label" class="control-label">{{ label }}</label>
    <div class="row">
      <template v-for="(option) in options" :key="option">
        <div :class="['col-md-' + (props.column ?? 6), 'py-2']">
          <div class="form-check form-check-inline">
            <input
              class="form-check-input primary"
              type="checkbox"
              :id="label + '-' + option"
              :value="option"
              :checked="modelValue.includes(option)"
              @change="handleChange"
            />
            <label class="form-check-label" :for="label + '-' + option">{{ option }}</label>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { SkillFormData } from '../../../../types/Skill';
import { SKILL_TAG_OPTIONS } from '../../../../types/Skill';
import type { Hero } from '../../../../types/Hero';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import FormTextarea from '../../../../components/FormInput/FormTextarea.vue';
import CheckboxGroup from '../../../../components/FormInput/CheckboxGroup.vue';

const props = defineProps<{
  formData: SkillFormData;
  heroes: Hero[];
  selectedTags: string[];
}>();

const emit = defineEmits<{
  (e: 'update:formData', value: SkillFormData): void;
  (e: 'update:selectedTags', value: string[]): void;
}>();

const tagOptions = [...SKILL_TAG_OPTIONS];

const updateField = <K extends keyof SkillFormData>(field: K, value: SkillFormData[K]) => {
  emit('update:formData', { ...props.formData, [field]: value });
};
</script>

<template>
  <div class="skill-form-step1">
    <h5 class="mb-4">
      <i class="ti ti-info-circle me-2"></i>
      Data Dasar Skill
    </h5>

    <!-- Hero Selection -->
    <div class="row mb-3">
      <div class="col-12">
        <label class="form-label fw-semibold">Hero <span class="text-danger">*</span></label>
        <select 
          class="form-select" 
          required 
          :value="formData.heroId"
          @change="updateField('heroId', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Pilih Hero</option>
          <option v-for="hero in heroes" :key="hero._id" :value="hero._id">
            {{ hero.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Skill Name & Type -->
    <div class="row">
      <div class="col-md-6">
        <FormInput 
          type="text" 
          label="Nama Skill" 
          :modelValue="formData.name"
          @update:modelValue="updateField('name', $event)"
          placeholder="Contoh: Inspire"
          required 
        />
      </div>
      <div class="col-md-6">
        <label class="form-label fw-semibold">Tipe Skill <span class="text-danger">*</span></label>
        <select 
          class="form-select" 
          required 
          :value="formData.type"
          @change="updateField('type', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Pilih Tipe Skill</option>
          <option value="Passive">Passive</option>
          <option value="Skill 1">Skill 1</option>
          <option value="Skill 2">Skill 2</option>
          <option value="Ultimate">Ultimate</option>
        </select>
        <small v-if="formData.type === 'Passive'" class="text-info">
          <i class="ti ti-info-circle me-1"></i>
          Passive skill tidak memerlukan data detail per level
        </small>
      </div>
    </div>

    <!-- Skill Icon -->
    <div class="row">
      <div class="col-12">
        <FormInput 
          type="text" 
          label="URL Icon Skill" 
          :modelValue="formData.skill_icon"
          @update:modelValue="updateField('skill_icon', $event)"
          placeholder="https://example.com/skill-icon.png"
          required 
        />
      </div>
    </div>

    <!-- Tags -->
    <div class="row">
      <div class="col-12">
        <CheckboxGroup
          :options="tagOptions"
          :modelValue="selectedTags"
          @update:modelValue="emit('update:selectedTags', $event)"
          label="Tag (Maksimal 2)"
          :max="2"
        />
      </div>
    </div>

    <!-- Descriptions -->
    <div class="row">
      <div class="col-md-6">
        <FormTextarea
          label="Deskripsi Singkat"
          :modelValue="formData.lite_description"
          @update:modelValue="updateField('lite_description', $event)"
          :rows="4"
          placeholder="Deskripsi singkat skill"
          required
        />
      </div>
      <div class="col-md-6">
        <FormTextarea
          label="Deskripsi Lengkap"
          :modelValue="formData.full_description"
          @update:modelValue="updateField('full_description', $event)"
          :rows="4"
          placeholder="Deskripsi lengkap skill dengan {{attribute}} untuk nilai dinamis"
          required
        />
        <small class="text-muted">
          Gunakan <code v-pre>{{attribute_name}}</code> untuk nilai yang berubah berdasarkan level
        </small>
      </div>
    </div>
  </div>
</template>

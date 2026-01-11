<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import FormTextarea from '../../../../components/FormInput/FormTextarea.vue';
import CheckboxGroup from '../../../../components/FormInput/CheckboxGroup.vue';
import type { HeroFormData } from '../../../../types/Hero';
import { HERO_TYPE_OPTIONS, HERO_ROLE_OPTIONS } from '../../../../types/Hero';

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  heroForm: HeroFormData;
  selectedRoles: string[];
  selectedTypes: string[];
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:heroForm', value: HeroFormData): void;
  (e: 'update:selectedRoles', value: string[]): void;
  (e: 'update:selectedTypes', value: string[]): void;
}>();

const typeOptions = [...HERO_TYPE_OPTIONS];
const roleOptions = [...HERO_ROLE_OPTIONS];

const updateFormField = <K extends keyof HeroFormData>(field: K, value: HeroFormData[K]) => {
  emit('update:heroForm', { ...props.heroForm, [field]: value });
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="form-group">
        <!-- Row 1: Basic Info -->
        <div class="row pt-3">
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Nama" 
              :modelValue="heroForm.name"
              @update:modelValue="updateFormField('name', $event)"
              required 
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Alias" 
              :modelValue="heroForm.alias"
              @update:modelValue="updateFormField('alias', $event)"
              required 
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Tanggal Rilis" 
              :modelValue="heroForm.release_date"
              @update:modelValue="updateFormField('release_date', $event)"
              required
            />
          </div>
        </div>

        <!-- Row 2: Speciality & Region -->
        <div class="row">
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Speciality" 
              :modelValue="heroForm.speciality"
              @update:modelValue="updateFormField('speciality', $event)"
              required 
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Region" 
              :modelValue="heroForm.region"
              @update:modelValue="updateFormField('region', $event)"
              required 
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="number" 
              min="1" 
              max="200" 
              label="Hero Order" 
              :modelValue="heroForm.hero_order"
              @update:modelValue="updateFormField('hero_order', Number($event))"
              required
            />
          </div>
        </div>

        <!-- Row 3: Role, Type, Description -->
        <div class="row">
          <div class="col-md-6 col-lg-4">
            <CheckboxGroup
              :options="roleOptions"
              :modelValue="selectedRoles"
              @update:modelValue="emit('update:selectedRoles', $event)"
              label="Role"
              :max="2"
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <CheckboxGroup
              :options="typeOptions"
              :modelValue="selectedTypes"
              @update:modelValue="emit('update:selectedTypes', $event)"
              label="Tipe"
              :max="2"
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormTextarea
              label="Deskripsi Singkat"
              :modelValue="heroForm.short_description"
              @update:modelValue="updateFormField('short_description', $event)"
              :rows="5"
              placeholder="Deskripsi Singkat Hero"
              required
            />
          </div>
        </div>

        <!-- Row 4: Images -->
        <div class="row">
          <div class="col-md-6">
            <FormInput 
              type="text" 
              label="Gambar" 
              :modelValue="heroForm.image"
              @update:modelValue="updateFormField('image', $event)"
              required
            />
          </div>
          <div class="col-md-6">
            <FormInput 
              type="text" 
              label="Avatar" 
              :modelValue="heroForm.avatar"
              @update:modelValue="updateFormField('avatar', $event)"
              required
            />
          </div>
        </div>

        <!-- Row 5: Stats -->
        <div class="row">
          <div class="col-sm-6 col-md-4 col-lg-3">
            <FormInput 
              type="number" 
              min="1" 
              max="100" 
              label="Durability" 
              :modelValue="heroForm.durability"
              @update:modelValue="updateFormField('durability', Number($event))"
              required
            />
          </div>
          <div class="col-sm-6 col-md-4 col-lg-3">
            <FormInput 
              type="number" 
              min="1" 
              max="100" 
              label="Offense" 
              :modelValue="heroForm.offense"
              @update:modelValue="updateFormField('offense', Number($event))"
              required
            />
          </div>
          <div class="col-sm-6 col-md-4 col-lg-3">
            <FormInput 
              type="number" 
              min="1" 
              max="100" 
              label="Control Effect" 
              :modelValue="heroForm.control_effect"
              @update:modelValue="updateFormField('control_effect', Number($event))"
              required
            />
          </div>
          <div class="col-sm-6 col-md-4 col-lg-3">
            <FormInput 
              type="number" 
              min="1" 
              max="100" 
              label="Difficulty" 
              :modelValue="heroForm.difficulty"
              @update:modelValue="updateFormField('difficulty', Number($event))"
              required
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <Button
          type="submit"
          class="btn-success waves-effect"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          Simpan
        </Button>
        <Button
          type="button"
          class="btn btn-secondary waves-effect"
          data-bs-dismiss="modal"
          @click="emit('cancel')"
        >
          Batal
        </Button>
      </div>
    </ModalBody>
  </Modal>
</template>

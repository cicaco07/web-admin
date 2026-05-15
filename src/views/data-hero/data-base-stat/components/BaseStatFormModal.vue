<script setup lang="ts">
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import type { BaseStatFormData } from '../../../../types/BaseStat';
import { BASE_STAT_FIELD_GROUPS } from '../../../../types/BaseStat';
import type { Hero } from '../../../../types/Hero';

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  baseStatForm: BaseStatFormData;
  heroes: Hero[];
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:baseStatForm', value: BaseStatFormData): void;
}>();

const fieldGroups = BASE_STAT_FIELD_GROUPS;

const updateHero = (heroId: string) => {
  emit('update:baseStatForm', { ...props.baseStatForm, heroId });
};

const updateField = (field: keyof BaseStatFormData, raw: string) => {
  const num = Number(raw);
  const value = Number.isFinite(num) ? Math.trunc(num) : 0;
  emit('update:baseStatForm', { ...props.baseStatForm, [field]: value });
};

const handleSubmit = () => {
  emit('submit');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="handleSubmit">
      <div class="form-group pt-2">
        <div class="mb-4">
          <label class="form-label">
            Hero
            <span class="text-danger">*</span>
          </label>
          <select
            class="form-select"
            :value="baseStatForm.heroId"
            @change="updateHero(($event.target as HTMLSelectElement).value)"
            required
          >
            <option value="" disabled>Pilih Hero</option>
            <option v-for="hero in heroes" :key="hero._id" :value="hero._id">
              {{ hero.name }} - {{ hero.role.join(', ') }}
            </option>
          </select>
        </div>

        <div v-for="group in fieldGroups" :key="group.title" class="mb-4">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom">
            <span class="badge me-2" :class="`bg-${group.color} bg-opacity-10 text-${group.color}`">
              <i :class="group.icon"></i>
            </span>
            <h6 class="mb-0 fw-semibold">{{ group.title }}</h6>
          </div>

          <div class="row">
            <div
              v-for="field in group.fields"
              :key="field.key"
              class="col-md-4 col-sm-6 mb-3"
            >
              <label class="form-label">
                {{ field.label }}
                <span class="text-danger">*</span>
              </label>
              <input
                type="number"
                class="form-control"
                :placeholder="`Masukkan ${field.label}`"
                min="0"
                step="1"
                :value="baseStatForm[field.key]"
                @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
                required
              />
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="row mt-2">
          <div class="col-12 d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleCancel"
              data-bs-dismiss="modal"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn"
              :class="headerColor === 'primary' ? 'btn-primary' : 'btn-warning'"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </ModalBody>
  </Modal>
</template>

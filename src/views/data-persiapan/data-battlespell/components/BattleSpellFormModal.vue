<script setup lang="ts">
// Removed unused imports
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import FormTextarea from '../../../../components/FormInput/FormTextarea.vue';
import type { BattleSpellFormData } from '../../../../types/BattleSpell';

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  battleSpellForm: BattleSpellFormData;
  originalIcon?: string;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:battleSpellForm', value: BattleSpellFormData): void;
}>();

const updateFormField = <K extends keyof BattleSpellFormData>(field: K, value: BattleSpellFormData[K]) => {
  emit('update:battleSpellForm', { ...props.battleSpellForm, [field]: value });
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="form-group">
        <div class="row pt-3">
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Nama" 
              :modelValue="battleSpellForm.name"
              @update:modelValue="updateFormField('name', $event)"
              required
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Tag" 
              :modelValue="battleSpellForm.tag"
              @update:modelValue="updateFormField('tag', $event)"
              required
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="number" 
              label="Cooldown" 
              :modelValue="battleSpellForm.cooldown"
              @update:modelValue="updateFormField('cooldown', Number($event))"
              required
              min="0"
              step="1"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <div class="mb-3">
              <FormInput 
                type="text" 
                label="Icon URL"
                :modelValue="battleSpellForm.icon as string"
                @update:modelValue="updateFormField('icon', $event)"
                required
              />
              <div class="form-text mt-n2 mb-2">
                Masukkan URL gambar icon
              </div>
            </div>
          </div>

          <div class="col-md-12">
            <FormTextarea 
              label="Deskripsi" 
              :modelValue="battleSpellForm.description"
              @update:modelValue="updateFormField('description', $event)"
              required
              placeholder="Deskripsi Battle Spell"
              :rows="4"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer mt-3">
        <Button
          type="submit"
          :class="headerColor === 'primary' ? 'btn-success' : 'btn-warning'"
          class="waves-effect"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          {{ headerColor === 'primary' ? 'Simpan' : 'Update' }}
        </Button>
        <Button
          type="button"
          class="btn btn-secondary waves-effect"
          data-bs-dismiss="modal"
          @click="handleCancel"
        >
          Batal
        </Button>
      </div>
    </ModalBody>
  </Modal>
</template>

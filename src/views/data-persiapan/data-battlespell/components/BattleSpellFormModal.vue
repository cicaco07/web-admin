<script setup lang="ts">
import { ref, watch } from 'vue';
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

const imagePreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const updateFormField = <K extends keyof BattleSpellFormData>(field: K, value: BattleSpellFormData[K]) => {
  emit('update:battleSpellForm', { ...props.battleSpellForm, [field]: value });
};

// Reset preview when form changes (for edit modal)
watch(() => props.battleSpellForm, () => {
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}, { deep: true });

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    updateFormField('icon', file);

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  updateFormField('icon', null);
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleCancel = () => {
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
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
              <label class="form-label fw-semibold">
                Icon <span class="text-danger">*</span>
              </label>
              <input
                ref="fileInput"
                type="file"
                class="form-control"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                @change="handleFileChange"
              />
              <div class="form-text">
                Upload icon (JPEG, PNG, GIF, WebP) - Max: 5MB
              </div>

              <!-- Image Previews -->
              <div class="d-flex gap-4 mt-3">
                <!-- Original Icon (edit mode) -->
                <div v-if="originalIcon">
                  <label class="form-label">Current Image</label>
                  <div>
                    <img
                      :src="`http://localhost:3000${originalIcon}`"
                      alt="Current icon"
                      class="img-thumbnail"
                      style="max-width: 100px; max-height: 100px; object-fit: cover;"
                    />
                  </div>
                </div>

                <!-- New Image Preview -->
                <div v-if="imagePreview">
                  <label class="form-label">{{ originalIcon ? 'New Image' : 'Preview' }}</label>
                  <div class="d-flex align-items-center gap-3">
                    <img
                      :src="imagePreview"
                      alt="Icon preview"
                      class="img-thumbnail"
                      style="max-width: 100px; max-height: 100px; object-fit: cover; border: 2px solid #28a745;"
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeImage"
                    >
                      <i class="ti ti-trash"></i> Remove
                    </button>
                  </div>
                </div>
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

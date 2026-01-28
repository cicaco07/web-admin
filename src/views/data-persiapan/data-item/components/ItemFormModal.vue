<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import FormTextarea from '../../../../components/FormInput/FormTextarea.vue';
import type { ItemFormData } from '../../../../types/Item';
import { ITEM_TYPE_OPTIONS } from '../../../../types/Item';

interface DynamicField {
  id: number;
  value: string;
}

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  itemForm: ItemFormData;
}>();

const emit = defineEmits<{
  (e: 'submit', data: { attributes: string[]; description: string[] }): void;
  (e: 'cancel'): void;
  (e: 'update:itemForm', value: ItemFormData): void;
}>();

const typeOptions = [...ITEM_TYPE_OPTIONS];

// Dynamic fields
const attributeFields = ref<DynamicField[]>([{ id: Date.now(), value: '' }]);
const descriptionFields = ref<DynamicField[]>([{ id: Date.now() + 1, value: '' }]);

// Initialize fields when form changes (for edit mode)
watch(() => props.itemForm, (newForm) => {
  if (newForm.attributes && newForm.attributes.length > 0) {
    attributeFields.value = newForm.attributes.map((val, idx) => ({
      id: Date.now() + idx,
      value: val
    }));
  } else {
    attributeFields.value = [{ id: Date.now(), value: '' }];
  }

  if (newForm.description && newForm.description.length > 0) {
    descriptionFields.value = newForm.description.map((val, idx) => ({
      id: Date.now() + idx + 100,
      value: val
    }));
  } else {
    descriptionFields.value = [{ id: Date.now() + 1, value: '' }];
  }
}, { immediate: true, deep: true });

const updateFormField = <K extends keyof ItemFormData>(field: K, value: ItemFormData[K]) => {
  emit('update:itemForm', { ...props.itemForm, [field]: value });
};

// Attribute field management
const addAttributeField = () => {
  attributeFields.value.push({ id: Date.now() + Math.random(), value: '' });
};
const removeAttributeField = (idx: number) => {
  attributeFields.value.splice(idx, 1);
};

// Description field management
const addDescriptionField = () => {
  descriptionFields.value.push({ id: Date.now() + Math.random(), value: '' });
};
const removeDescriptionField = (idx: number) => {
  descriptionFields.value.splice(idx, 1);
};

const handleSubmit = () => {
  const attributes = attributeFields.value.map(f => f.value).filter(Boolean);
  const description = descriptionFields.value.map(f => f.value).filter(Boolean);
  emit('submit', { attributes, description });
};

const handleCancel = () => {
  attributeFields.value = [{ id: Date.now(), value: '' }];
  descriptionFields.value = [{ id: Date.now() + 1, value: '' }];
  emit('cancel');
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="handleSubmit">
      <div class="form-group">
        <div class="row pt-3">
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Nama Item" 
              :modelValue="itemForm.name"
              @update:modelValue="updateFormField('name', $event)"
              required
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Tag Item" 
              :modelValue="itemForm.tag"
              @update:modelValue="updateFormField('tag', $event)"
              required
            />
          </div>
          <div class="col-md-6 col-lg-4 mb-3">
            <label class="form-label fw-semibold">Tipe</label>
            <select 
              class="form-select" 
              :value="itemForm.type"
              @change="updateFormField('type', ($event.target as HTMLSelectElement).value)"
              required
            >
              <option value="" disabled>Pilih Tipe</option>
              <option v-for="type in typeOptions" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="number" 
              label="Harga" 
              :modelValue="itemForm.price"
              @update:modelValue="updateFormField('price', $event)"
              required
              min="1"
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Gambar (URL)" 
              :modelValue="itemForm.image"
              @update:modelValue="updateFormField('image', $event)"
              required
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormTextarea
              label="Tips"
              :modelValue="itemForm.tips"
              @update:modelValue="updateFormField('tips', $event)"
              :rows="3"
            />
          </div>
        </div>

        <div class="row">
          <!-- Dynamic Attributes -->
          <div class="col-md-6 col-lg-4">
            <label class="form-label fw-semibold">Attribut</label>
            <div
              v-for="(field, idx) in attributeFields"
              :key="field.id"
              class="d-flex align-items-center mb-2 gap-2"
            >
              <input
                type="text"
                class="form-control"
                v-model="field.value"
                placeholder="Masukkan Attribut"
              />
              <button
                v-if="idx === 0"
                @click.prevent="addAttributeField"
                class="btn btn-success"
                type="button"
              >
                <i class="ti ti-plus"></i>
              </button>
              <button
                v-else
                @click.prevent="removeAttributeField(idx)"
                class="btn btn-danger"
                type="button"
              >
                <i class="ti ti-minus"></i>
              </button>
            </div>
          </div>

          <!-- Dynamic Descriptions -->
          <div class="col-md-6 col-lg-4">
            <label class="form-label fw-semibold">Deskripsi</label>
            <div
              v-for="(field, idx) in descriptionFields"
              :key="field.id"
              class="d-flex align-items-center mb-2 gap-2"
            >
              <textarea
                class="form-control"
                rows="2"
                placeholder="Masukkan Deskripsi"
                v-model="field.value"
              ></textarea>
              <button
                v-if="idx === 0"
                @click.prevent="addDescriptionField"
                class="btn btn-success"
                type="button"
              >
                <i class="ti ti-plus"></i>
              </button>
              <button
                v-else
                @click.prevent="removeDescriptionField(idx)"
                class="btn btn-danger"
                type="button"
              >
                <i class="ti ti-minus"></i>
              </button>
            </div>
          </div>

          <div class="col-md-6 col-lg-4">
            <FormTextarea 
              label="Cerita" 
              :modelValue="itemForm.story"
              @update:modelValue="updateFormField('story', $event)"
              :rows="5"
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

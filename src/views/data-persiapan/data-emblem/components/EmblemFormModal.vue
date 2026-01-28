<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import type { EmblemFormData, EmblemAttribute } from '../../../../types/Emblem';
import { EMBLEM_TYPE_OPTIONS } from '../../../../types/Emblem';

interface AttributeField {
  id: number;
  key: string;
  value: string;
  icon: string;
}

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  emblemForm: EmblemFormData;
}>();

const emit = defineEmits<{
  (e: 'submit', attributes: EmblemAttribute[]): void;
  (e: 'cancel'): void;
  (e: 'update:emblemForm', value: EmblemFormData): void;
}>();

const typeOptions = [...EMBLEM_TYPE_OPTIONS];

// Attribute fields management
const textFields = ref<AttributeField[]>([{ id: Date.now(), key: '', value: '', icon: '' }]);

// Initialize fields when form changes (for edit mode)
watch(() => props.emblemForm.attributes, (newAttributes) => {
  if (newAttributes && newAttributes.length > 0) {
    textFields.value = newAttributes.map((attr, index) => {
      const keys = Object.keys(attr).filter(k => k !== 'icon');
      const key = keys[0] || '';
      return {
        id: Date.now() + index,
        key,
        value: String(attr[key] || ''),
        icon: attr.icon || ''
      };
    });
  } else {
    textFields.value = [{ id: Date.now(), key: '', value: '', icon: '' }];
  }
}, { immediate: true });

const updateFormField = <K extends keyof EmblemFormData>(field: K, value: EmblemFormData[K]) => {
  emit('update:emblemForm', { ...props.emblemForm, [field]: value });
};

const addTextField = () => {
  textFields.value.push({ id: Date.now() + Math.random(), key: '', value: '', icon: '' });
};

const removeTextField = (index: number) => {
  textFields.value.splice(index, 1);
};

const handleSubmit = () => {
  const attributes = textFields.value
    .filter(field => field.key.trim() && field.value.trim())
    .map(field => ({
      [field.key]: parseFloat(field.value) || field.value,
      icon: field.icon
    }));
  emit('submit', attributes);
};

const handleCancel = () => {
  textFields.value = [{ id: Date.now(), key: '', value: '', icon: '' }];
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
              label="Nama Emblem" 
              :modelValue="emblemForm.name"
              @update:modelValue="updateFormField('name', $event)"
              required
            />
          </div>
          <div class="col-md-6 col-lg-4 mb-3">
            <label class="form-label fw-semibold">Tipe</label>
            <select 
              class="form-select" 
              :value="emblemForm.type"
              @change="updateFormField('type', ($event.target as HTMLSelectElement).value)"
              required
            >
              <option value="" disabled>Pilih Tipe</option>
              <option v-for="type in typeOptions" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Ikon (URL)" 
              :modelValue="emblemForm.icon"
              @update:modelValue="updateFormField('icon', $event)"
              required
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Benefit" 
              :modelValue="emblemForm.benefit"
              @update:modelValue="updateFormField('benefit', $event)"
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Deskripsi" 
              :modelValue="emblemForm.description"
              @update:modelValue="updateFormField('description', $event)"
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Cooldown" 
              :modelValue="emblemForm.cooldown"
              @update:modelValue="updateFormField('cooldown', $event)"
            />
          </div>
        </div>

        <!-- Dynamic Attributes -->
        <div class="row">
          <div class="col-12">
            <label class="form-label fw-semibold">Attribut</label>
            <div
              v-for="(field, idx) in textFields"
              :key="field.id"
              class="d-flex align-items-center mb-2 gap-2"
            >
              <input
                type="text"
                class="form-control"
                v-model="field.key"
                placeholder="Nama (hp, defense, etc)"
                style="flex: 1;"
              />
              <input
                type="text"
                class="form-control"
                v-model="field.value"
                placeholder="Nilai"
                style="flex: 1;"
              />
              <input
                type="text"
                class="form-control"
                v-model="field.icon"
                placeholder="Icon URL"
                style="flex: 1;"
              />
              <button
                v-if="idx === 0"
                @click.prevent="addTextField"
                class="btn btn-success"
                type="button"
              >
                <i class="ti ti-plus"></i>
              </button>
              <button
                v-else
                @click.prevent="removeTextField(idx)"
                class="btn btn-danger"
                type="button"
              >
                <i class="ti ti-minus"></i>
              </button>
            </div>
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

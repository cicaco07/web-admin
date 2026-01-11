<script setup lang="ts">
import { computed, watch } from 'vue';
import Modal from '../../../../components/Modal/Modal.vue';
import ModalHeader from '../../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../../components/Modal/ModalBody.vue';
import Button from '../../../../components/Button/Button.vue';
import FormInput from '../../../../components/FormInput/FormInput.vue';
import CheckboxGroup from '../../../../components/FormInput/CheckboxGroup.vue';
import type { NavigationFormData } from '../../../../types/Navigation';
import { ROLE_OPTIONS } from '../../../../types/Navigation';

interface ParentOption {
  _id: string;
  name: string;
}

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  navigationForm: NavigationFormData;
  selectedRoles: string[];
  parentMenuOptions: ParentOption[];
  orderError?: string;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:navigationForm', value: NavigationFormData): void;
  (e: 'update:selectedRoles', value: string[]): void;
}>();

const roleOptions = [...ROLE_OPTIONS];

const updateFormField = <K extends keyof NavigationFormData>(field: K, value: NavigationFormData[K]) => {
  emit('update:navigationForm', { ...props.navigationForm, [field]: value });
};

// Auto-set is_header based on parent
const canChangeIsHeader = computed(() => !props.navigationForm.parent_id);

// Watch parent_id changes
watch(() => props.navigationForm.parent_id, (newParentId) => {
  if (newParentId) {
    updateFormField('is_header', false);
    updateFormField('level', 1);
  } else {
    updateFormField('level', 0);
  }
});
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="form-group">
        <div class="row pt-3">
          <!-- Name -->
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Nama" 
              :modelValue="navigationForm.name"
              @update:modelValue="updateFormField('name', $event)"
              required
            />
          </div>

          <!-- Route -->
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Route" 
              :modelValue="navigationForm.route"
              @update:modelValue="updateFormField('route', $event)"
            />
          </div>

          <!-- Icon -->
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Icon" 
              :modelValue="navigationForm.icon"
              @update:modelValue="updateFormField('icon', $event)"
            />
          </div>

          <!-- Parent Selection -->
          <div class="col-md-6 col-lg-4">
            <label class="form-label fw-semibold">Parent</label>
            <select 
              class="form-select" 
              :value="navigationForm.parent_id ?? ''"
              @change="updateFormField('parent_id', ($event.target as HTMLSelectElement).value || null)"
            >
              <option value="">Tidak ada (Parent Menu)</option>
              <option 
                v-for="nav in parentMenuOptions" 
                :key="nav._id" 
                :value="nav._id"
                :disabled="nav._id === navigationForm._id"
              >
                {{ nav.name }}
              </option>
            </select>
            <small class="text-muted">Pilih parent untuk membuat submenu</small>
          </div>

          <!-- Role -->
          <div class="col-md-6 col-lg-4">
            <CheckboxGroup
              :options="roleOptions"
              :modelValue="selectedRoles"
              @update:modelValue="emit('update:selectedRoles', $event)"
              label="Role"
              :max="3"
            />
          </div>

          <!-- Order -->
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="number" 
              label="Urutan" 
              :modelValue="navigationForm.order"
              @update:modelValue="updateFormField('order', Number($event))"
              required
              :class="{ 'is-invalid': orderError }"
            />
            <div v-if="orderError" class="invalid-feedback d-block">
              {{ orderError }}
            </div>
          </div>

          <!-- Menu Type -->
          <div class="col-md-6 col-lg-4">
            <label class="form-label fw-semibold">
              Tipe Menu
              <span v-if="!canChangeIsHeader" class="text-muted">(Otomatis)</span>
            </label>
            <select 
              class="form-select" 
              :value="navigationForm.is_header"
              @change="updateFormField('is_header', ($event.target as HTMLSelectElement).value === 'true')"
              :disabled="!canChangeIsHeader"
              required
            >
              <option :value="true">Header</option>
              <option :value="false">Submenu</option>
            </select>
            <small v-if="!canChangeIsHeader" class="text-muted">
              Karena memiliki parent, otomatis menjadi submenu
            </small>
            <small v-else class="text-muted">
              Header = Menu utama, Submenu = Menu child
            </small>
          </div>

          <!-- Component -->
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="text" 
              label="Component" 
              :modelValue="navigationForm.component"
              @update:modelValue="updateFormField('component', $event)"
            />
          </div>

          <!-- Level (readonly) -->
          <div class="col-md-6 col-lg-4">
            <FormInput 
              type="number" 
              label="Level" 
              :modelValue="navigationForm.level"
              @update:modelValue="updateFormField('level', Number($event))"
              required
              readonly
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <Button
          type="submit"
          :class="headerColor === 'primary' ? 'btn-success' : 'btn-warning'"
          class="waves-effect"
          :disabled="isSubmitting || !!orderError"
          :loading="isSubmitting"
        >
          {{ headerColor === 'primary' ? 'Simpan' : 'Update' }}
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

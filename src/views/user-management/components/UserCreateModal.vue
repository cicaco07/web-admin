<script setup lang="ts">
import { computed } from 'vue';
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import AppSelect from '../../../components/AppSelect.vue';
import type { SelectOption } from '../../../components/AppSelect.vue';
import type { UserCreateFormData } from '../../../types/UserManagement';
import { USER_ROLE_OPTIONS } from '../../../types/UserManagement';

const props = defineProps<{
  modalId: string;
  isSubmitting: boolean;
  form: UserCreateFormData;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:form', value: UserCreateFormData): void;
}>();

const update = <K extends keyof UserCreateFormData>(field: K, value: UserCreateFormData[K]) =>
  emit('update:form', { ...props.form, [field]: value });

const roleSelectOptions = computed<SelectOption[]>(() =>
  USER_ROLE_OPTIONS.map(role => ({ id: role, text: role }))
);
</script>

<template>
  <Modal :id="modalId" size="lg">
    <ModalHeader backgroundColor="primary">Tambah User</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="row pt-3">
        <div class="col-md-6 mb-3">
          <label class="form-label">Nama <span class="text-danger">*</span></label>
          <input
            class="form-control"
            :value="form.name"
            @input="update('name', ($event.target as HTMLInputElement).value)"
            required
          />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Email <span class="text-danger">*</span></label>
          <input
            type="email"
            class="form-control"
            :value="form.email"
            @input="update('email', ($event.target as HTMLInputElement).value)"
            required
          />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Password <span class="text-danger">*</span></label>
          <input
            type="password"
            minlength="6"
            class="form-control"
            :value="form.password"
            @input="update('password', ($event.target as HTMLInputElement).value)"
            required
          />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Role <span class="text-danger">*</span></label>
          <AppSelect
            :modelValue="form.role"
            :options="roleSelectOptions"
            placeholder="Pilih Role"
            @change="(val: string | number | null) => update('role', (val as UserCreateFormData['role']) ?? 'user')"
          />
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
          @click="emit('cancel')"
        >
          Batal
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
          Simpan
        </button>
      </div>
    </ModalBody>
  </Modal>
</template>

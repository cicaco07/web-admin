<script setup lang="ts">
import { computed } from 'vue';
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import AppSelect from '../../../components/AppSelect.vue';
import type { SelectOption } from '../../../components/AppSelect.vue';
import type { UserRoleFormData } from '../../../types/UserManagement';
import { USER_ROLE_OPTIONS } from '../../../types/UserManagement';

const props = defineProps<{
  modalId: string;
  isSubmitting: boolean;
  form: UserRoleFormData;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:form', value: UserRoleFormData): void;
}>();

const updateRole = (role: UserRoleFormData['role']) =>
  emit('update:form', { ...props.form, role });

const roleSelectOptions = computed<SelectOption[]>(() =>
  USER_ROLE_OPTIONS.map(role => ({ id: role, text: role }))
);
</script>

<template>
  <Modal :id="modalId" size="md">
    <ModalHeader backgroundColor="warning">Edit Role User</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="pt-3">
        <div class="mb-3">
          <label class="form-label">Nama</label>
          <input class="form-control" :value="form.name" disabled />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input class="form-control" :value="form.email" disabled />
        </div>
        <div class="mb-3">
          <label class="form-label">Role</label>
          <AppSelect
            :modelValue="form.role"
            :options="roleSelectOptions"
            placeholder="Pilih Role"
            @change="(val: string | number | null) => updateRole((val as UserRoleFormData['role']) ?? 'user')"
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
        <button type="submit" class="btn btn-warning" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
          Simpan
        </button>
      </div>
    </ModalBody>
  </Modal>
</template>

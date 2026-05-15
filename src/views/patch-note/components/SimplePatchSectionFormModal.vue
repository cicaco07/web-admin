<script setup lang="ts">
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import type { PatchNote, SimplePatchNoteSectionFormData } from '../../../types/PatchNote';

const props = defineProps<{ modalId: string; title: string; headerColor: 'primary' | 'warning'; isSubmitting: boolean; form: SimplePatchNoteSectionFormData; patchNotes: PatchNote[] }>();
const emit = defineEmits<{ (e: 'submit'): void; (e: 'cancel'): void; (e: 'update:form', value: SimplePatchNoteSectionFormData): void }>();
const update = <K extends keyof SimplePatchNoteSectionFormData>(field: K, value: SimplePatchNoteSectionFormData[K]) => emit('update:form', { ...props.form, [field]: value });
</script>

<template>
  <Modal :id="modalId" size="lg">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="pt-3">
        <div class="mb-3">
          <label class="form-label">Patch Note <span class="text-danger">*</span></label>
          <select class="form-select" :value="form.patchNoteId" @change="update('patchNoteId', ($event.target as HTMLSelectElement).value)" required>
            <option value="" disabled>Pilih Patch Note</option>
            <option v-for="patch in patchNotes" :key="patch._id" :value="patch._id">{{ patch.name }} (Season {{ patch.season }})</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Judul <span class="text-danger">*</span></label>
          <input class="form-control" :value="form.title" @input="update('title', ($event.target as HTMLInputElement).value)" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Deskripsi <span class="text-danger">*</span></label>
          <textarea class="form-control" rows="4" :value="form.description" @input="update('description', ($event.target as HTMLTextAreaElement).value)" required></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Change Details (JSON)</label>
          <textarea class="form-control font-monospace" rows="5" :value="form.change_details" @input="update('change_details', ($event.target as HTMLTextAreaElement).value)"></textarea>
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-3">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="emit('cancel')">Batal</button>
        <button type="submit" class="btn" :class="headerColor === 'primary' ? 'btn-primary' : 'btn-warning'" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>Simpan
        </button>
      </div>
    </ModalBody>
  </Modal>
</template>

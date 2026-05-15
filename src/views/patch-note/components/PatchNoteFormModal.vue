<script setup lang="ts">
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import type { PatchNoteFormData } from '../../../types/PatchNote';
import { PATCH_NOTE_TYPE_OPTIONS } from '../../../types/PatchNote';

const props = defineProps<{ modalId: string; title: string; headerColor: 'primary' | 'warning'; isSubmitting: boolean; patchNoteForm: PatchNoteFormData }>();
const emit = defineEmits<{ (e: 'submit'): void; (e: 'cancel'): void; (e: 'update:patchNoteForm', value: PatchNoteFormData): void }>();
const update = <K extends keyof PatchNoteFormData>(field: K, value: PatchNoteFormData[K]) => emit('update:patchNoteForm', { ...props.patchNoteForm, [field]: value });
</script>

<template>
  <Modal :id="modalId" size="lg">
    <ModalHeader :backgroundColor="headerColor">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="row pt-3">
        <div class="col-md-6 mb-3">
          <label class="form-label">Nama Patch <span class="text-danger">*</span></label>
          <input class="form-control" :value="patchNoteForm.name" @input="update('name', ($event.target as HTMLInputElement).value)" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Season <span class="text-danger">*</span></label>
          <input type="number" min="0" class="form-control" :value="patchNoteForm.season" @input="update('season', Number(($event.target as HTMLInputElement).value))" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Tipe <span class="text-danger">*</span></label>
          <select class="form-select" :value="patchNoteForm.type" @change="update('type', ($event.target as HTMLSelectElement).value as PatchNoteFormData['type'])" required>
            <option v-for="type in PATCH_NOTE_TYPE_OPTIONS" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Tanggal Mulai <span class="text-danger">*</span></label>
          <input type="date" class="form-control" :value="patchNoteForm.start_date" @input="update('start_date', ($event.target as HTMLInputElement).value)" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Tanggal Selesai <span class="text-danger">*</span></label>
          <input type="date" class="form-control" :value="patchNoteForm.end_date" @input="update('end_date', ($event.target as HTMLInputElement).value)" required />
        </div>
        <div class="col-md-12 mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" :checked="patchNoteForm.is_active" @change="update('is_active', ($event.target as HTMLInputElement).checked)" />
            <label class="form-check-label">Aktif</label>
          </div>
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

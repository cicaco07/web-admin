<script setup lang="ts">
import { computed } from 'vue';
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import AppSelect from '../../../components/AppSelect.vue';
import type { SelectOption } from '../../../components/AppSelect.vue';
import type { PatchNoteFormData } from '../../../types/PatchNote';
import { PATCH_NOTE_STATUS_OPTIONS, PATCH_NOTE_TYPE_OPTIONS } from '../../../types/PatchNote';

const props = defineProps<{
  modalId: string;
  title: string;
  headerColor: 'primary' | 'warning';
  isSubmitting: boolean;
  patchNoteForm: PatchNoteFormData;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:patchNoteForm', value: PatchNoteFormData): void;
}>();

const update = <K extends keyof PatchNoteFormData>(field: K, value: PatchNoteFormData[K]) =>
  emit('update:patchNoteForm', { ...props.patchNoteForm, [field]: value });

const typeSelectOptions = computed<SelectOption[]>(() =>
  PATCH_NOTE_TYPE_OPTIONS.map(type => ({ id: type, text: type }))
);

const statusSelectOptions = computed<SelectOption[]>(() =>
  PATCH_NOTE_STATUS_OPTIONS.map(status => ({ id: status, text: status }))
);
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
          <label class="form-label">Version</label>
          <input class="form-control" :value="patchNoteForm.version" placeholder="2.1.88" @input="update('version', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Season <span class="text-danger">*</span></label>
          <input type="number" min="0" class="form-control" :value="patchNoteForm.season" @input="update('season', Number(($event.target as HTMLInputElement).value))" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Tipe <span class="text-danger">*</span></label>
          <AppSelect :modelValue="patchNoteForm.type" :options="typeSelectOptions" placeholder="Pilih Tipe" @change="(val: string | number | null) => update('type', (val as PatchNoteFormData['type']) ?? 'PATCH')" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Status</label>
          <AppSelect :modelValue="patchNoteForm.status" :options="statusSelectOptions" placeholder="Pilih Status" @change="(val: string | number | null) => update('status', (val as PatchNoteFormData['status']) ?? 'DRAFT')" />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Tanggal Mulai <span class="text-danger">*</span></label>
          <input type="date" class="form-control" :value="patchNoteForm.start_date" @input="update('start_date', ($event.target as HTMLInputElement).value)" required />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Tanggal Selesai <span class="text-danger">*</span></label>
          <input type="date" class="form-control" :value="patchNoteForm.end_date" @input="update('end_date', ($event.target as HTMLInputElement).value)" required />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Published At</label>
          <input type="date" class="form-control" :value="patchNoteForm.published_at" @input="update('published_at', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Source URL</label>
          <input class="form-control" :value="patchNoteForm.source_url" placeholder="https://www.mobilelegends.com/..." @input="update('source_url', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Source News ID</label>
          <input class="form-control" :value="patchNoteForm.source_newsid" @input="update('source_newsid', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="col-md-12 mb-3">
          <label class="form-label">Summary</label>
          <textarea class="form-control" rows="2" :value="patchNoteForm.summary" @input="update('summary', ($event.target as HTMLTextAreaElement).value)"></textarea>
        </div>
        <div class="col-md-12 mb-3">
          <label class="form-label">Raw Content</label>
          <textarea class="form-control font-monospace" rows="5" :value="patchNoteForm.raw_content" @input="update('raw_content', ($event.target as HTMLTextAreaElement).value)"></textarea>
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
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
          Simpan
        </button>
      </div>
    </ModalBody>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import type { HeroPatchNoteFormData, PatchChangeType, PatchNote } from '../../../types/PatchNote';
import { PATCH_CHANGE_TYPE_OPTIONS } from '../../../types/PatchNote';

const props = defineProps<{ modalId: string; title: string; headerColor: 'primary' | 'warning'; isSubmitting: boolean; form: HeroPatchNoteFormData; patchNotes: PatchNote[] }>();
const emit = defineEmits<{ (e: 'submit'): void; (e: 'cancel'): void; (e: 'update:form', value: HeroPatchNoteFormData): void }>();
const update = <K extends keyof HeroPatchNoteFormData>(field: K, value: HeroPatchNoteFormData[K]) => emit('update:form', { ...props.form, [field]: value });
const addHeroChange = () => update('hero_changes', [...props.form.hero_changes, { name: '', alias: '', change_type: 'adjusted', description: '', change_details: [] }]);
const removeHeroChange = (index: number) => update('hero_changes', props.form.hero_changes.filter((_, i) => i !== index));
const updateHeroChange = (index: number, key: 'name' | 'alias' | 'change_type' | 'description', value: string) => {
  const next = props.form.hero_changes.map((item, i) => i === index ? { ...item, [key]: key === 'change_type' ? value as PatchChangeType : value } : item);
  update('hero_changes', next);
};
</script>

<template>
  <Modal :id="modalId" size="xl">
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
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Judul <span class="text-danger">*</span></label>
            <input class="form-control" :value="form.title" @input="update('title', ($event.target as HTMLInputElement).value)" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Deskripsi <span class="text-danger">*</span></label>
            <input class="form-control" :value="form.description" @input="update('description', ($event.target as HTMLInputElement).value)" required />
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">Hero Changes</h6>
          <button type="button" class="btn btn-outline-primary btn-sm" @click="addHeroChange"><i class="ti ti-plus me-1"></i>Tambah Hero</button>
        </div>
        <div v-for="(change, index) in form.hero_changes" :key="index" class="border rounded p-3 mb-3">
          <div class="row">
            <div class="col-md-3 mb-2"><input class="form-control" placeholder="Nama Hero" :value="change.name" @input="updateHeroChange(index, 'name', ($event.target as HTMLInputElement).value)" required /></div>
            <div class="col-md-3 mb-2"><input class="form-control" placeholder="Alias" :value="change.alias" @input="updateHeroChange(index, 'alias', ($event.target as HTMLInputElement).value)" /></div>
            <div class="col-md-3 mb-2"><select class="form-select" :value="change.change_type" @change="updateHeroChange(index, 'change_type', ($event.target as HTMLSelectElement).value)"><option v-for="type in PATCH_CHANGE_TYPE_OPTIONS" :key="type" :value="type">{{ type }}</option></select></div>
            <div class="col-md-3 mb-2 text-end"><button type="button" class="btn btn-danger btn-sm" @click="removeHeroChange(index)"><i class="ti ti-trash"></i></button></div>
            <div class="col-12"><textarea class="form-control" rows="2" placeholder="Deskripsi perubahan" :value="change.description" @input="updateHeroChange(index, 'description', ($event.target as HTMLTextAreaElement).value)" required></textarea></div>
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

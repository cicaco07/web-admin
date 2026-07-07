<script setup lang="ts">
import { computed } from 'vue';
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import type { PatchChangeDetail, PatchChangeFormData, PatchChangeType, PatchTargetType } from '../../../types/PatchNote';
import { PATCH_CHANGE_TYPE_OPTIONS, PATCH_TARGET_TYPE_OPTIONS } from '../../../types/PatchNote';

type Option = { _id: string; name: string; alias?: string };

const props = defineProps<{
  modalId: string;
  title: string;
  isSubmitting: boolean;
  form: PatchChangeFormData;
  heroes: Option[];
  items: Option[];
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
  (e: 'update:form', value: PatchChangeFormData): void;
}>();

const update = <K extends keyof PatchChangeFormData>(field: K, value: PatchChangeFormData[K]) => emit('update:form', { ...props.form, [field]: value });
const targetOptions = computed(() => props.form.target_type === 'ITEM' ? props.items : props.heroes);

const updateTargetRef = (id: string) => {
  const target = targetOptions.value.find((item) => item._id === id);
  emit('update:form', { ...props.form, target_ref: id, target_name: target?.name || props.form.target_name });
};

const addDetail = () => {
  emit('update:form', {
    ...props.form,
    details: [...props.form.details, { field: '', old_value: '', new_value: '', raw_text: '' }],
  });
};

const updateDetail = <K extends keyof PatchChangeDetail>(index: number, field: K, value: PatchChangeDetail[K]) => {
  const details = props.form.details.map((detail, detailIndex) => detailIndex === index ? { ...detail, [field]: value } : detail);
  emit('update:form', { ...props.form, details });
};

const removeDetail = (index: number) => {
  emit('update:form', { ...props.form, details: props.form.details.filter((_, detailIndex) => detailIndex !== index) });
};
</script>

<template>
  <Modal :id="modalId" size="xl">
    <ModalHeader backgroundColor="primary">{{ title }}</ModalHeader>
    <ModalBody :onSubmit="() => emit('submit')">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Target Type</label>
          <select class="form-select" :value="form.target_type" @change="update('target_type', ($event.target as HTMLSelectElement).value as PatchTargetType)">
            <option v-for="option in PATCH_TARGET_TYPE_OPTIONS" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div class="col-md-5">
          <label class="form-label">Target Ref</label>
          <select v-if="form.target_type === 'HERO' || form.target_type === 'ITEM'" class="form-select" :value="form.target_ref" @change="updateTargetRef(($event.target as HTMLSelectElement).value)">
            <option value="">Unlinked / Manual</option>
            <option v-for="option in targetOptions" :key="option._id" :value="option._id">{{ option.name }}{{ option.alias ? ` (${option.alias})` : '' }}</option>
          </select>
          <input v-else class="form-control" value="Tidak membutuhkan target ref" disabled />
        </div>
        <div class="col-md-4">
          <label class="form-label">Target Name <span class="text-danger">*</span></label>
          <input class="form-control" :value="form.target_name" @input="update('target_name', ($event.target as HTMLInputElement).value)" required />
        </div>
        <div class="col-md-3">
          <label class="form-label">Change Type</label>
          <select class="form-select" :value="form.change_type" @change="update('change_type', ($event.target as HTMLSelectElement).value as PatchChangeType)">
            <option v-for="option in PATCH_CHANGE_TYPE_OPTIONS" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Section</label>
          <input class="form-control" :value="form.section" placeholder="Attributes / Skill 1" @input="update('section', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Title</label>
          <input class="form-control" :value="form.title" @input="update('title', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Order</label>
          <input type="number" class="form-control" :value="form.order" @input="update('order', Number(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="col-12">
          <label class="form-label">Description <span class="text-danger">*</span></label>
          <textarea class="form-control" rows="2" :value="form.description" @input="update('description', ($event.target as HTMLTextAreaElement).value)" required></textarea>
        </div>
        <div class="col-12">
          <label class="form-label">Raw Text</label>
          <textarea class="form-control font-monospace" rows="3" :value="form.raw_text" @input="update('raw_text', ($event.target as HTMLTextAreaElement).value)"></textarea>
        </div>
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">Details</h6>
            <button class="btn btn-sm btn-outline-primary" type="button" @click="addDetail"><i class="ti ti-plus me-1"></i>Tambah Detail</button>
          </div>
          <div v-if="form.details.length === 0" class="alert alert-light border">Belum ada detail angka/perubahan.</div>
          <div v-for="(detail, index) in form.details" :key="index" class="border rounded p-3 mb-2">
            <div class="row g-2 align-items-end">
              <div class="col-md-2"><label class="form-label">Field</label><input class="form-control" :value="detail.field" @input="updateDetail(index, 'field', ($event.target as HTMLInputElement).value)" /></div>
              <div class="col-md-2"><label class="form-label">Old</label><input class="form-control" :value="detail.old_value" @input="updateDetail(index, 'old_value', ($event.target as HTMLInputElement).value)" /></div>
              <div class="col-md-2"><label class="form-label">New</label><input class="form-control" :value="detail.new_value" @input="updateDetail(index, 'new_value', ($event.target as HTMLInputElement).value)" /></div>
              <div class="col-md-1"><label class="form-label">Unit</label><input class="form-control" :value="detail.unit" @input="updateDetail(index, 'unit', ($event.target as HTMLInputElement).value)" /></div>
              <div class="col-md-4"><label class="form-label">Raw</label><input class="form-control" :value="detail.raw_text" @input="updateDetail(index, 'raw_text', ($event.target as HTMLInputElement).value)" /></div>
              <div class="col-md-1"><button type="button" class="btn btn-outline-danger w-100" @click="removeDetail(index)"><i class="ti ti-trash"></i></button></div>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="emit('cancel')">Batal</button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting"><span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>Simpan</button>
      </div>
    </ModalBody>
  </Modal>
</template>

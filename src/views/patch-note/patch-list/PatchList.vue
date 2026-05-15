<script setup lang="ts">
import { computed, ref } from 'vue';
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';
import PatchNoteFormModal from '../components/PatchNoteFormModal.vue';
import { usePatchNotes } from '../../../lib/api/PatchNoteApi';
import { usePatchNoteService } from '../../../lib/service/PatchNoteService';
import type { PatchNote, PatchNoteFormData } from '../../../types/PatchNote';
import { createDefaultPatchNoteForm } from '../../../types/PatchNote';

const { result, loading, refetch } = usePatchNotes();
const patchNotes = computed<PatchNote[]>(() => result.value?.patchNotes || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddPatchNote, handleEditPatchNote, handleDeletePatchNote } = usePatchNoteService(safeRefetch);
const searchQuery = ref('');
const filtered = computed(() => patchNotes.value.filter((item) => !searchQuery.value.trim() || item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.value.toLowerCase())));
const currentPage = ref(1);
const itemsPerPage = ref(10);
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value));
const form = ref<PatchNoteFormData>(createDefaultPatchNoteForm());
const editForm = ref<PatchNoteFormData>(createDefaultPatchNoteForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);
const resetForm = () => { form.value = createDefaultPatchNoteForm(); };
const resetEditForm = () => { editForm.value = createDefaultPatchNoteForm(); };
const formatDateForInput = (value: string) => value ? new Date(value).toISOString().slice(0, 10) : '';
const openEdit = (item: PatchNote) => { editForm.value = { _id: item._id, name: item.name, start_date: formatDateForInput(item.start_date), end_date: formatDateForInput(item.end_date), type: item.type, season: item.season, is_active: item.is_active }; };
const onAdd = async () => { isSubmitting.value = true; try { await handleAddPatchNote(form.value); resetForm(); } finally { isSubmitting.value = false; } };
const onEdit = async () => { isEditSubmitting.value = true; try { await handleEditPatchNote(editForm.value); resetEditForm(); } finally { isEditSubmitting.value = false; } };
</script>

<template>
  <DashboardLayout>
    <Breadcrumb title="Patch List" :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Patch Note' }, { name: 'Patch List' }]" />
    <div class="card"><div class="border-bottom title-part-padding"><h4 class="card-title mb-0">Daftar Patch Note</h4></div>
      <div class="card-body">
        <div class="row mb-3"><div class="col-md-10"><div class="input-group"><span class="input-group-text bg-primary text-white"><i class="ti ti-search"></i></span><input v-model="searchQuery" class="form-control" placeholder="Cari nama atau tipe patch..." @keyup="currentPage = 1" /></div></div><div class="col-md-2"><button class="btn btn-outline-secondary w-100" @click="searchQuery = ''; currentPage = 1"><i class="ti ti-refresh me-1"></i>Reset</button></div></div>
        <div class="d-flex justify-content-end mb-3"><ModalButton variant="info" font="medium" size="lg" dataBsTarget="add-patch-note"><i class="ti ti-plus me-1"></i>Tambah Patch</ModalButton></div>
        <PatchNoteFormModal modalId="add-patch-note" title="Tambah Patch Note" headerColor="primary" :isSubmitting="isSubmitting" :patchNoteForm="form" @update:patchNoteForm="form = $event" @submit="onAdd" @cancel="resetForm" />
        <PatchNoteFormModal modalId="edit-patch-note" title="Edit Patch Note" headerColor="warning" :isSubmitting="isEditSubmitting" :patchNoteForm="editForm" @update:patchNoteForm="editForm = $event" @submit="onEdit" @cancel="resetEditForm" />
        <div class="table-responsive"><table class="table table-bordered table-hover"><thead class="table-light"><tr class="text-center"><th>No</th><th>Nama</th><th>Tipe</th><th>Season</th><th>Periode</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-4">Memuat data...</td></tr>
          <tr v-for="(item, index) in paginated" :key="item._id" class="text-center align-middle" v-show="!loading"><td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td><td>{{ item.name }}</td><td><span class="badge bg-info">{{ item.type }}</span></td><td>{{ item.season }}</td><td>{{ formatDateForInput(item.start_date) }} - {{ formatDateForInput(item.end_date) }}</td><td><span class="badge" :class="item.is_active ? 'bg-success' : 'bg-secondary'">{{ item.is_active ? 'Aktif' : 'Nonaktif' }}</span></td><td><div class="d-flex gap-1 justify-content-center"><ModalButton variant="warning" font="medium" size="sm" dataBsTarget="edit-patch-note" @click="openEdit(item)"><i class="ti ti-edit"></i></ModalButton><Button variant="danger" font="medium" size="sm" type="button" @click="handleDeletePatchNote(item._id)"><i class="ti ti-trash"></i></Button></div></td></tr>
          <tr v-if="!loading && paginated.length === 0"><td colspan="7" class="text-center text-muted py-4">Tidak ada data patch note</td></tr>
        </tbody></table></div>
        <TablePagination v-if="!loading && filtered.length > 0" v-model:currentPage="currentPage" v-model:itemsPerPage="itemsPerPage" :totalItems="filtered.length" :pageSizeOptions="[10, 25, 50]" />
      </div></div>
  </DashboardLayout>
</template>

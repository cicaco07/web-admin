<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';
import HeroPatchNoteFormModal from '../components/HeroPatchNoteFormModal.vue';
import { usePatchNotes } from '../../../lib/api/PatchNoteApi';
import { usePatchNoteService } from '../../../lib/service/PatchNoteService';
import type { HeroPatchNote, HeroPatchNoteFormData, PatchNote } from '../../../types/PatchNote';
import { createDefaultHeroPatchNoteForm } from '../../../types/PatchNote';
import '../patch-note.css';

const router = useRouter();
const { result, loading, refetch } = usePatchNotes();
const patchNotes = computed<PatchNote[]>(() => result.value?.patchNotes || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddHeroPatchNote, handleEditHeroPatchNote, handleDeleteHeroPatchNote } = usePatchNoteService(safeRefetch);
const rows = computed(() => patchNotes.value.flatMap((patch) => (patch.hero_changes || []).map((section) => ({ ...section, patch }))));
const searchQuery = ref('');
const filtered = computed(() => rows.value.filter((row) => !searchQuery.value.trim() || row.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || row.patch.name.toLowerCase().includes(searchQuery.value.toLowerCase())));
const currentPage = ref(1);
const itemsPerPage = ref(10);
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value));
const form = ref<HeroPatchNoteFormData>(createDefaultHeroPatchNoteForm());
const editForm = ref<HeroPatchNoteFormData>(createDefaultHeroPatchNoteForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);
const resetForm = () => { form.value = createDefaultHeroPatchNoteForm(); };
const resetEditForm = () => { editForm.value = createDefaultHeroPatchNoteForm(); };
const openEdit = (row: HeroPatchNote & { patch: PatchNote }) => { editForm.value = { _id: row._id, patchNoteId: row.patch._id, title: row.title, description: row.description, hero_changes: row.hero_changes || [] }; };
const onAdd = async () => { isSubmitting.value = true; try { await handleAddHeroPatchNote(form.value); resetForm(); } finally { isSubmitting.value = false; } };
const onEdit = async () => { isEditSubmitting.value = true; try { await handleEditHeroPatchNote(editForm.value); resetEditForm(); } finally { isEditSubmitting.value = false; } };
</script>

<template>
  <DashboardLayout>
    <Breadcrumb title="Patch Note Hero" :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Patch Note' }, { name: 'Hero' }]" />
    <div class="card"><div class="border-bottom title-part-padding patch-card-header"><div><h4 class="card-title mb-1">Patch Note Hero</h4><small class="text-muted">Kelola perubahan hero untuk setiap patch note.</small></div><div class="patch-page-actions"><Button class="patch-action-btn" variant="outline-primary" type="button" @click="router.push('/patch-note/history/hero')"><i class="ti ti-history"></i>Riwayat Hasil Parsing</Button><ModalButton class="patch-action-btn" variant="info" font="medium" dataBsTarget="add-hero-patch-note"><i class="ti ti-plus"></i>Tambah Hero Patch</ModalButton></div></div><div class="card-body">
      <div class="row g-2 mb-3"><div class="col-md-10"><div class="input-group"><span class="input-group-text bg-primary text-white"><i class="ti ti-search"></i></span><input v-model="searchQuery" class="form-control" placeholder="Cari judul atau patch..." @keyup="currentPage = 1" /></div></div><div class="col-md-2"><button class="btn btn-outline-secondary w-100" @click="searchQuery = ''; currentPage = 1"><i class="ti ti-refresh me-1"></i>Reset</button></div></div>
      <HeroPatchNoteFormModal modalId="add-hero-patch-note" title="Tambah Patch Hero" headerColor="primary" :isSubmitting="isSubmitting" :form="form" :patchNotes="patchNotes" @update:form="form = $event" @submit="onAdd" @cancel="resetForm" />
      <HeroPatchNoteFormModal modalId="edit-hero-patch-note" title="Edit Patch Hero" headerColor="warning" :isSubmitting="isEditSubmitting" :form="editForm" :patchNotes="patchNotes" @update:form="editForm = $event" @submit="onEdit" @cancel="resetEditForm" />
      <div class="table-responsive"><table class="table table-bordered table-hover patch-table"><thead class="table-light"><tr class="text-center"><th>No</th><th>Patch</th><th>Judul</th><th>Jumlah Hero</th><th>Deskripsi</th><th>Aksi</th></tr></thead><tbody>
        <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
        <tr v-for="(row, index) in paginated" :key="row._id" class="text-center align-middle" v-show="!loading"><td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td><td>{{ row.patch.name }}</td><td>{{ row.title }}</td><td>{{ row.hero_changes?.length || 0 }}</td><td class="text-start patch-description-cell">{{ row.description }}</td><td class="patch-action-cell"><div class="d-flex justify-content-center gap-1"><ModalButton class="patch-icon-btn" variant="warning" font="medium" size="sm" dataBsTarget="edit-hero-patch-note" title="Edit patch hero" aria-label="Edit patch hero" @click="openEdit(row)"><i class="ti ti-edit"></i></ModalButton><Button class="patch-icon-btn" variant="danger" size="sm" type="button" title="Hapus patch hero" aria-label="Hapus patch hero" @click="handleDeleteHeroPatchNote(row._id)"><i class="ti ti-trash"></i></Button></div></td></tr>
        <tr v-if="!loading && paginated.length === 0"><td colspan="6" class="text-center text-muted py-4">Tidak ada data hero patch</td></tr>
      </tbody></table></div>
      <TablePagination v-if="!loading && filtered.length > 0" v-model:currentPage="currentPage" v-model:itemsPerPage="itemsPerPage" :totalItems="filtered.length" :pageSizeOptions="[10, 25, 50]" />
    </div></div>
  </DashboardLayout>
</template>

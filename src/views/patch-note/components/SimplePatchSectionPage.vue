<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';
import SimplePatchSectionFormModal from './SimplePatchSectionFormModal.vue';
import { usePatchNotes } from '../../../lib/api/PatchNoteApi';
import { usePatchNoteService } from '../../../lib/service/PatchNoteService';
import type { PatchNote, SimplePatchNoteSection, SimplePatchNoteSectionFormData } from '../../../types/PatchNote';
import { createDefaultSimplePatchNoteSectionForm } from '../../../types/PatchNote';
import '../patch-note.css';

const props = defineProps<{ title: string; breadcrumb: string; kind: 'battlefield' | 'system' | 'gameMode'; collectionKey: 'battlefield_changes' | 'system_changes' | 'game_mode_changes'; modalPrefix: string }>();
const router = useRouter();
const historyPath = computed(() => `/patch-note/history/${props.kind === 'gameMode' ? 'game-mode' : props.kind}`);
const { result, loading, refetch } = usePatchNotes();
const patchNotes = computed<PatchNote[]>(() => result.value?.patchNotes || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddSimpleSection, handleEditSimpleSection, handleDeleteSimpleSection } = usePatchNoteService(safeRefetch);
const rows = computed(() => patchNotes.value.flatMap((patch) => (patch[props.collectionKey] || []).map((section) => ({ ...section, patch }))));
const searchQuery = ref('');
const filtered = computed(() => rows.value.filter((row) => !searchQuery.value.trim() || row.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || row.patch.name.toLowerCase().includes(searchQuery.value.toLowerCase())));
const currentPage = ref(1);
const itemsPerPage = ref(10);
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value));
const form = ref<SimplePatchNoteSectionFormData>(createDefaultSimplePatchNoteSectionForm());
const editForm = ref<SimplePatchNoteSectionFormData>(createDefaultSimplePatchNoteSectionForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);
const addModalId = computed(() => `add-${props.modalPrefix}-patch-note`);
const editModalId = computed(() => `edit-${props.modalPrefix}-patch-note`);
const resetForm = () => { form.value = createDefaultSimplePatchNoteSectionForm(); };
const resetEditForm = () => { editForm.value = createDefaultSimplePatchNoteSectionForm(); };
const detailsToText = (value?: Record<string, unknown>) => JSON.stringify(value || {}, null, 2);
const openEdit = (row: SimplePatchNoteSection & { patch: PatchNote }) => { editForm.value = { _id: row._id, patchNoteId: row.patch._id, title: row.title, description: row.description, change_details: detailsToText(row.change_details) }; };
const onAdd = async () => { isSubmitting.value = true; try { await handleAddSimpleSection(props.kind, form.value); resetForm(); } finally { isSubmitting.value = false; } };
const onEdit = async () => { isEditSubmitting.value = true; try { await handleEditSimpleSection(props.kind, editForm.value); resetEditForm(); } finally { isEditSubmitting.value = false; } };
</script>

<template>
  <DashboardLayout>
    <Breadcrumb :title="title" :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Patch Note' }, { name: breadcrumb }]" />
    <div class="card"><div class="border-bottom title-part-padding patch-card-header"><div><h4 class="card-title mb-1">{{ title }}</h4><small class="text-muted">Kelola bagian {{ breadcrumb.toLowerCase() }} untuk setiap patch note.</small></div><div class="patch-page-actions"><Button class="patch-action-btn" variant="outline-primary" type="button" @click="router.push(historyPath)"><i class="ti ti-history"></i>Riwayat Hasil Parsing</Button><ModalButton class="patch-action-btn" variant="info" font="medium" :dataBsTarget="addModalId"><i class="ti ti-plus"></i>Tambah {{ breadcrumb }}</ModalButton></div></div><div class="card-body">
      <div class="row g-2 mb-3"><div class="col-md-10"><div class="input-group"><span class="input-group-text bg-primary text-white"><i class="ti ti-search"></i></span><input v-model="searchQuery" class="form-control" placeholder="Cari judul atau patch..." @keyup="currentPage = 1" /></div></div><div class="col-md-2"><button class="btn btn-outline-secondary w-100" @click="searchQuery = ''; currentPage = 1"><i class="ti ti-refresh me-1"></i>Reset</button></div></div>
      <SimplePatchSectionFormModal :modalId="addModalId" :title="`Tambah ${breadcrumb}`" headerColor="primary" :isSubmitting="isSubmitting" :form="form" :patchNotes="patchNotes" @update:form="form = $event" @submit="onAdd" @cancel="resetForm" />
      <SimplePatchSectionFormModal :modalId="editModalId" :title="`Edit ${breadcrumb}`" headerColor="warning" :isSubmitting="isEditSubmitting" :form="editForm" :patchNotes="patchNotes" @update:form="editForm = $event" @submit="onEdit" @cancel="resetEditForm" />
      <div class="table-responsive"><table class="table table-bordered table-hover patch-table"><thead class="table-light"><tr class="text-center"><th>No</th><th>Patch</th><th>Judul</th><th>Deskripsi</th><th>Aksi</th></tr></thead><tbody>
        <tr v-if="loading"><td colspan="5" class="text-center py-4">Memuat data...</td></tr>
        <tr v-for="(row, index) in paginated" :key="row._id" class="text-center align-middle" v-show="!loading"><td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td><td>{{ row.patch.name }}</td><td>{{ row.title }}</td><td class="text-start patch-description-cell">{{ row.description }}</td><td class="patch-action-cell"><div class="d-flex justify-content-center gap-1"><ModalButton class="patch-icon-btn" variant="warning" font="medium" size="sm" :dataBsTarget="editModalId" :title="`Edit ${breadcrumb}`" :aria-label="`Edit ${breadcrumb}`" @click="openEdit(row)"><i class="ti ti-edit"></i></ModalButton><Button class="patch-icon-btn" variant="danger" size="sm" type="button" :title="`Hapus ${breadcrumb}`" :aria-label="`Hapus ${breadcrumb}`" @click="handleDeleteSimpleSection(kind, row._id)"><i class="ti ti-trash"></i></Button></div></td></tr>
        <tr v-if="!loading && paginated.length === 0"><td colspan="5" class="text-center text-muted py-4">Tidak ada data</td></tr>
      </tbody></table></div>
      <TablePagination v-if="!loading && filtered.length > 0" v-model:currentPage="currentPage" v-model:itemsPerPage="itemsPerPage" :totalItems="filtered.length" :pageSizeOptions="[10, 25, 50]" />
    </div></div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import ModalBody from '../../../components/Modal/ModalBody.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';
import PatchNoteFormModal from '../components/PatchNoteFormModal.vue';
import { usePatchNotes } from '../../../lib/api/PatchNoteApi';
import { usePatchNoteService } from '../../../lib/service/PatchNoteService';
import type { PatchNote, PatchNoteFormData } from '../../../types/PatchNote';
import { createDefaultPatchNoteForm } from '../../../types/PatchNote';

const router = useRouter();
const { result, loading, refetch } = usePatchNotes();
const patchNotes = computed<PatchNote[]>(() => result.value?.patchNotes || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const {
  handleAddPatchNote,
  handleEditPatchNote,
  handleDeletePatchNote,
  handleImportPatchNote,
  handlePublishPatchNote,
  handleUnpublishPatchNote,
} = usePatchNoteService(safeRefetch);

const searchQuery = ref('');
const statusFilter = ref('');
const importUrl = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const form = ref<PatchNoteFormData>(createDefaultPatchNoteForm());
const editForm = ref<PatchNoteFormData>(createDefaultPatchNoteForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);
const isImporting = ref(false);

const filtered = computed(() => patchNotes.value.filter((item) => {
  const keyword = searchQuery.value.trim().toLowerCase();
  const matchesKeyword = !keyword || [item.name, item.type, item.version, item.source_newsid].some((value) => String(value || '').toLowerCase().includes(keyword));
  const matchesStatus = !statusFilter.value || (item.status || '').toUpperCase() === statusFilter.value;
  return matchesKeyword && matchesStatus;
}));

const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value));
const resetForm = () => { form.value = createDefaultPatchNoteForm(); };
const resetEditForm = () => { editForm.value = createDefaultPatchNoteForm(); };
const resetFilters = () => { searchQuery.value = ''; statusFilter.value = ''; currentPage.value = 1; };
const formatDateForInput = (value?: string) => value ? new Date(value).toISOString().slice(0, 10) : '';
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('id-ID') : '-';
const statusValue = (item: PatchNote) => String(item.status || (item.is_active ? 'PUBLISHED' : 'DRAFT')).toUpperCase();
const statusClass = (item: PatchNote) => statusValue(item) === 'PUBLISHED' ? 'bg-success' : 'bg-secondary';

const openEdit = (item: PatchNote) => {
  editForm.value = {
    _id: item._id,
    name: item.name,
    version: item.version || '',
    start_date: formatDateForInput(item.start_date),
    end_date: formatDateForInput(item.end_date),
    published_at: formatDateForInput(item.published_at),
    type: item.type,
    season: item.season,
    is_active: item.is_active,
    status: statusValue(item) as PatchNoteFormData['status'],
    source_url: item.source_url || '',
    source_newsid: item.source_newsid || '',
    summary: item.summary || '',
    raw_content: item.raw_content || '',
  };
};

const onAdd = async () => { isSubmitting.value = true; try { await handleAddPatchNote(form.value); resetForm(); } finally { isSubmitting.value = false; } };
const onEdit = async () => { isEditSubmitting.value = true; try { await handleEditPatchNote(editForm.value); resetEditForm(); } finally { isEditSubmitting.value = false; } };
const onImport = async () => { if (!importUrl.value.trim()) return; isImporting.value = true; try { await handleImportPatchNote(importUrl.value.trim()); importUrl.value = ''; } finally { isImporting.value = false; } };
</script>

<template>
  <DashboardLayout>
    <Breadcrumb title="Patch List" :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Patch Note' }, { name: 'Patch List' }]" />
    <div class="card">
      <div class="border-bottom title-part-padding d-flex justify-content-between align-items-center">
        <div>
          <h4 class="card-title mb-1">Daftar Patch Note</h4>
          <small class="text-muted">Kelola draft, import URL resmi, dan publish patch note.</small>
        </div>
        <div class="d-flex gap-2">
          <ModalButton variant="success" font="medium" size="lg" dataBsTarget="import-patch-note"><i class="ti ti-download me-1"></i>Import URL</ModalButton>
          <ModalButton variant="info" font="medium" size="lg" dataBsTarget="add-patch-note"><i class="ti ti-plus me-1"></i>Tambah Patch</ModalButton>
        </div>
      </div>
      <div class="card-body">
        <div class="row mb-3 g-2">
          <div class="col-md-7"><div class="input-group"><span class="input-group-text bg-primary text-white"><i class="ti ti-search"></i></span><input v-model="searchQuery" class="form-control" placeholder="Cari nama, tipe, versi, atau news id..." @keyup="currentPage = 1" /></div></div>
          <div class="col-md-3"><select v-model="statusFilter" class="form-select" @change="currentPage = 1"><option value="">Semua Status</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></div>
          <div class="col-md-2"><button class="btn btn-outline-secondary w-100" @click="resetFilters"><i class="ti ti-refresh me-1"></i>Reset</button></div>
        </div>

        <Modal id="import-patch-note" size="lg">
          <ModalHeader backgroundColor="success">Import Patch Note Dari URL</ModalHeader>
          <ModalBody :onSubmit="onImport">
            <div class="mb-3">
              <label class="form-label">URL Mobile Legends <span class="text-danger">*</span></label>
              <input v-model="importUrl" type="url" class="form-control" placeholder="https://www.mobilelegends.com/news/articleldetail?newsid=..." required />
              <small class="text-muted">Data akan masuk sebagai draft dan parsed changes perlu direview sebelum publish.</small>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-success" :disabled="isImporting"><span v-if="isImporting" class="spinner-border spinner-border-sm me-2"></span>Import</button>
            </div>
          </ModalBody>
        </Modal>

        <PatchNoteFormModal modalId="add-patch-note" title="Tambah Patch Note" headerColor="primary" :isSubmitting="isSubmitting" :patchNoteForm="form" @update:patchNoteForm="form = $event" @submit="onAdd" @cancel="resetForm" />
        <PatchNoteFormModal modalId="edit-patch-note" title="Edit Patch Note" headerColor="warning" :isSubmitting="isEditSubmitting" :patchNoteForm="editForm" @update:patchNoteForm="editForm = $event" @submit="onEdit" @cancel="resetEditForm" />

        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead class="table-light"><tr class="text-center"><th>No</th><th>Nama</th><th>Version</th><th>Tipe</th><th>Published</th><th>Status</th><th>Source</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr v-if="loading"><td colspan="8" class="text-center py-4">Memuat data...</td></tr>
              <tr v-for="(item, index) in paginated" :key="item._id" class="text-center align-middle" v-show="!loading">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td class="text-start"><strong>{{ item.name }}</strong><div class="text-muted small">Season {{ item.season }}</div></td>
                <td><span class="badge bg-light text-dark">{{ item.version || '-' }}</span></td>
                <td><span class="badge bg-info">{{ item.type }}</span></td>
                <td>{{ formatDate(item.published_at || item.start_date) }}</td>
                <td><span class="badge" :class="statusClass(item)">{{ statusValue(item) }}</span></td>
                <td><a v-if="item.source_url" :href="item.source_url" target="_blank" rel="noopener" class="small">{{ item.source_newsid || 'Open' }}</a><span v-else>-</span></td>
                <td><div class="d-flex gap-1 justify-content-center flex-wrap">
                  <Button variant="primary" font="medium" size="sm" type="button" @click="router.push(`/patch-note/patch-list/${item._id}`)"><i class="ti ti-eye"></i></Button>
                  <ModalButton variant="warning" font="medium" size="sm" dataBsTarget="edit-patch-note" @click="openEdit(item)"><i class="ti ti-edit"></i></ModalButton>
                  <Button v-if="statusValue(item) !== 'PUBLISHED'" variant="success" font="medium" size="sm" type="button" @click="handlePublishPatchNote(item._id)"><i class="ti ti-send"></i></Button>
                  <Button v-else variant="secondary" font="medium" size="sm" type="button" @click="handleUnpublishPatchNote(item._id)"><i class="ti ti-archive"></i></Button>
                  <Button variant="danger" font="medium" size="sm" type="button" @click="handleDeletePatchNote(item._id)"><i class="ti ti-trash"></i></Button>
                </div></td>
              </tr>
              <tr v-if="!loading && paginated.length === 0"><td colspan="8" class="text-center text-muted py-4">Tidak ada data patch note</td></tr>
            </tbody>
          </table>
        </div>
        <TablePagination v-if="!loading && filtered.length > 0" v-model:currentPage="currentPage" v-model:itemsPerPage="itemsPerPage" :totalItems="filtered.length" :pageSizeOptions="[10, 25, 50]" />
      </div>
    </div>
  </DashboardLayout>
</template>

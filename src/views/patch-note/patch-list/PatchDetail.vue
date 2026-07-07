<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import PatchChangeFormModal from '../components/PatchChangeFormModal.vue';
import { useHeroes } from '../../../lib/api/HeroApi';
import { useItems } from '../../../lib/api/ItemApi';
import { usePatchChanges, usePatchNote } from '../../../lib/api/PatchNoteApi';
import { usePatchNoteService } from '../../../lib/service/PatchNoteService';
import type { PatchChange, PatchChangeFormData } from '../../../types/PatchNote';
import { createDefaultPatchChangeForm } from '../../../types/PatchNote';

const route = useRoute();
const router = useRouter();
const patchNoteId = computed(() => String(route.params.id || ''));
const { result, loading, refetch } = usePatchNote(patchNoteId.value);
const { result: changesResult, loading: changesLoading, refetch: refetchChanges } = usePatchChanges({ patchNoteId: patchNoteId.value, includeDrafts: true });
const { result: heroesResult } = useHeroes();
const { result: itemsResult } = useItems();
const patchNote = computed(() => result.value?.patchNote);
const changes = computed<PatchChange[]>(() => changesResult.value?.patchChanges || []);
const heroes = computed(() => heroesResult.value?.heroes?.items || []);
const items = computed(() => itemsResult.value?.items || []);
const activeTab = ref<'changes' | 'raw' | 'overview'>('changes');
const changeForm = ref<PatchChangeFormData>(createDefaultPatchChangeForm(patchNoteId.value));
const isChangeSubmitting = ref(false);
const isEditingChange = ref(false);

const safeRefetch = async () => { await refetch(); await refetchChanges(); };
const { handlePublishPatchNote, handleUnpublishPatchNote, handleReparsePatchNote, handleAddPatchChange, handleEditPatchChange, handleDeletePatchChange } = usePatchNoteService(safeRefetch);
const statusValue = computed(() => String(patchNote.value?.status || (patchNote.value?.is_active ? 'PUBLISHED' : 'DRAFT')).toUpperCase());
const formatDate = (value?: string) => value ? new Date(value).toLocaleString('id-ID') : '-';
const badgeClass = (type?: string) => {
  const value = String(type || '').toUpperCase();
  if (value === 'BUFF' || value === 'NEW') return 'bg-success';
  if (value === 'NERF' || value === 'REMOVED') return 'bg-danger';
  if (value === 'ADJUSTED' || value === 'REWORK') return 'bg-warning text-dark';
  return 'bg-secondary';
};
const missingLinks = computed(() => changes.value.filter((change) => ['HERO', 'ITEM'].includes(String(change.target_type).toUpperCase()) && !change.target_ref).length);

const resetChangeForm = () => {
  isEditingChange.value = false;
  changeForm.value = createDefaultPatchChangeForm(patchNoteId.value);
};

const openCreateChange = () => resetChangeForm();
const openEditChange = (change: PatchChange) => {
  isEditingChange.value = true;
  changeForm.value = {
    _id: change._id,
    patchNoteId: patchNoteId.value,
    target_type: String(change.target_type).toUpperCase() as PatchChangeFormData['target_type'],
    target_ref: change.target_ref || '',
    target_name: change.target_name,
    change_type: String(change.change_type).toUpperCase() as PatchChangeFormData['change_type'],
    section: change.section,
    title: change.title || '',
    description: change.description,
    details: change.details || [],
    raw_text: change.raw_text || '',
    order: change.order,
  };
};
const submitChange = async () => {
  isChangeSubmitting.value = true;
  try {
    if (isEditingChange.value) await handleEditPatchChange(changeForm.value);
    else await handleAddPatchChange(changeForm.value);
    resetChangeForm();
  } finally { isChangeSubmitting.value = false; }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb title="Review Patch Note" :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Patch Note', href: '/patch-note/patch-list' }, { name: 'Review' }]" />
    <div v-if="loading" class="card"><div class="card-body text-center py-5">Memuat patch note...</div></div>
    <div v-else-if="!patchNote" class="card"><div class="card-body text-center py-5">Patch note tidak ditemukan.</div></div>
    <div v-else>
      <div class="card mb-3">
        <div class="card-body d-flex justify-content-between flex-wrap gap-3">
          <div>
            <button class="btn btn-link p-0 mb-2" @click="router.push('/patch-note/patch-list')"><i class="ti ti-arrow-left"></i> Kembali</button>
            <h3 class="mb-1">{{ patchNote.name }}</h3>
            <div class="d-flex gap-2 flex-wrap">
              <span class="badge bg-light text-dark">{{ patchNote.version || 'No version' }}</span>
              <span class="badge" :class="statusValue === 'PUBLISHED' ? 'bg-success' : 'bg-secondary'">{{ statusValue }}</span>
              <span class="badge bg-info">{{ patchNote.type }}</span>
              <a v-if="patchNote.source_url" :href="patchNote.source_url" target="_blank" rel="noopener" class="badge bg-primary text-white">Source {{ patchNote.source_newsid || '' }}</a>
            </div>
          </div>
          <div class="d-flex gap-2 align-items-start flex-wrap">
            <Button variant="warning" font="medium" size="sm" type="button" @click="handleReparsePatchNote(patchNote._id)"><i class="ti ti-refresh me-1"></i>Reparse</Button>
            <Button v-if="statusValue !== 'PUBLISHED'" variant="success" font="medium" size="sm" type="button" @click="handlePublishPatchNote(patchNote._id)"><i class="ti ti-send me-1"></i>Publish</Button>
            <Button v-else variant="secondary" font="medium" size="sm" type="button" @click="handleUnpublishPatchNote(patchNote._id)"><i class="ti ti-archive me-1"></i>Unpublish</Button>
            <ModalButton variant="primary" font="medium" size="sm" dataBsTarget="patch-change-form" @click="openCreateChange"><i class="ti ti-plus me-1"></i>Add Change</ModalButton>
          </div>
        </div>
      </div>

      <div v-if="missingLinks > 0" class="alert alert-warning">Ada {{ missingLinks }} hero/item change yang belum terhubung ke master data. Review target sebelum publish.</div>

      <div class="card">
        <div class="card-header d-flex gap-2">
          <button class="btn btn-sm" :class="activeTab === 'changes' ? 'btn-primary' : 'btn-outline-primary'" @click="activeTab = 'changes'">Parsed Changes</button>
          <button class="btn btn-sm" :class="activeTab === 'overview' ? 'btn-primary' : 'btn-outline-primary'" @click="activeTab = 'overview'">Overview</button>
          <button class="btn btn-sm" :class="activeTab === 'raw' ? 'btn-primary' : 'btn-outline-primary'" @click="activeTab = 'raw'">Raw Content</button>
        </div>
        <div class="card-body">
          <div v-if="activeTab === 'overview'" class="row g-3">
            <div class="col-md-4"><strong>Published</strong><div>{{ formatDate(patchNote.published_at) }}</div></div>
            <div class="col-md-4"><strong>Imported</strong><div>{{ formatDate(patchNote.imported_at) }}</div></div>
            <div class="col-md-4"><strong>Total Changes</strong><div>{{ changes.length }}</div></div>
            <div class="col-12"><strong>Summary</strong><p class="mb-0 mt-1">{{ patchNote.summary || '-' }}</p></div>
          </div>

          <div v-if="activeTab === 'raw'">
            <pre class="bg-light border rounded p-3 raw-content">{{ patchNote.raw_content || 'Tidak ada raw content.' }}</pre>
          </div>

          <div v-if="activeTab === 'changes'">
            <div v-if="changesLoading" class="text-center py-4">Memuat changes...</div>
            <div v-else class="table-responsive">
              <table class="table table-bordered table-hover align-middle">
                <thead class="table-light"><tr class="text-center"><th>Order</th><th>Target</th><th>Type</th><th>Section</th><th>Description</th><th>Details</th><th>Aksi</th></tr></thead>
                <tbody>
                  <tr v-for="change in changes" :key="change._id">
                    <td class="text-center">{{ change.order }}</td>
                    <td><strong>{{ change.target_name }}</strong><div class="small text-muted">{{ change.target_type }} <span v-if="!change.target_ref" class="badge bg-warning text-dark">Unlinked</span></div></td>
                    <td class="text-center"><span class="badge" :class="badgeClass(change.change_type)">{{ change.change_type }}</span></td>
                    <td>{{ change.section }}</td>
                    <td>{{ change.description }}</td>
                    <td><div v-if="change.details?.length"><div v-for="detail in change.details" :key="detail.raw_text" class="small"><strong>{{ detail.field }}</strong>: {{ detail.old_value || '-' }} → {{ detail.new_value || '-' }}</div></div><span v-else class="text-muted">-</span></td>
                    <td class="text-center"><div class="d-flex gap-1 justify-content-center"><ModalButton variant="warning" font="medium" size="sm" dataBsTarget="patch-change-form" @click="openEditChange(change)"><i class="ti ti-edit"></i></ModalButton><Button variant="danger" font="medium" size="sm" type="button" @click="handleDeletePatchChange(change._id)"><i class="ti ti-trash"></i></Button></div></td>
                  </tr>
                  <tr v-if="changes.length === 0"><td colspan="7" class="text-center text-muted py-4">Belum ada patch change.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PatchChangeFormModal modalId="patch-change-form" :title="isEditingChange ? 'Edit Patch Change' : 'Tambah Patch Change'" :isSubmitting="isChangeSubmitting" :form="changeForm" :heroes="heroes" :items="items" @update:form="changeForm = $event" @submit="submitChange" @cancel="resetChangeForm" />
  </DashboardLayout>
</template>

<style scoped>
.raw-content { max-height: 520px; overflow: auto; white-space: pre-wrap; }
</style>

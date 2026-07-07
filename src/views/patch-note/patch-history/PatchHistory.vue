<script setup lang="ts">
import { computed, ref } from 'vue';
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import { useHeroes } from '../../../lib/api/HeroApi';
import { useItems } from '../../../lib/api/ItemApi';
import { usePatchChanges } from '../../../lib/api/PatchNoteApi';
import type { PatchChange, PatchTargetType } from '../../../types/PatchNote';

const props = defineProps<{ targetType: 'HERO' | 'ITEM' }>();
const selectedTarget = ref('');
const includeDrafts = ref(false);
const targetType = computed<PatchTargetType>(() => props.targetType);
const { result: changesResult, loading } = usePatchChanges({ targetType: targetType.value, includeDrafts: true });
const { result: heroesResult } = useHeroes();
const { result: itemsResult } = useItems();

const targetOptions = computed(() => props.targetType === 'HERO' ? heroesResult.value?.heroes?.items || [] : itemsResult.value?.items || []);
const changes = computed<PatchChange[]>(() => changesResult.value?.patchChanges || []);
const filteredChanges = computed(() => changes.value.filter((change) => {
  const matchesTarget = !selectedTarget.value || change.target_ref === selectedTarget.value || change.target_name.toLowerCase() === selectedTargetName.value.toLowerCase();
  const matchesStatus = includeDrafts.value || String(change.patch_note?.status || '').toUpperCase() === 'PUBLISHED';
  return matchesTarget && matchesStatus;
}));
const selectedTargetName = computed(() => targetOptions.value.find((option: { _id: string; name: string }) => option._id === selectedTarget.value)?.name || '');
const pageTitle = computed(() => props.targetType === 'HERO' ? 'Hero Patch History' : 'Item Patch History');
const badgeClass = (type?: string) => {
  const value = String(type || '').toUpperCase();
  if (value === 'BUFF' || value === 'NEW') return 'bg-success';
  if (value === 'NERF' || value === 'REMOVED') return 'bg-danger';
  if (value === 'ADJUSTED' || value === 'REWORK') return 'bg-warning text-dark';
  return 'bg-secondary';
};
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('id-ID') : '-';
</script>

<template>
  <DashboardLayout>
    <Breadcrumb :title="pageTitle" :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Patch Note' }, { name: pageTitle }]" />
    <div class="card">
      <div class="border-bottom title-part-padding">
        <h4 class="card-title mb-1">{{ pageTitle }}</h4>
        <small class="text-muted">Lihat riwayat perubahan berdasarkan {{ props.targetType === 'HERO' ? 'hero' : 'item' }}.</small>
      </div>
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-md-8">
            <select v-model="selectedTarget" class="form-select">
              <option value="">Semua {{ props.targetType === 'HERO' ? 'Hero' : 'Item' }}</option>
              <option v-for="option in targetOptions" :key="option._id" :value="option._id">{{ option.name }}</option>
            </select>
          </div>
          <div class="col-md-4 d-flex align-items-center">
            <div class="form-check form-switch">
              <input id="includeDrafts" v-model="includeDrafts" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="includeDrafts">Tampilkan draft</label>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-center py-4">Memuat history...</div>
        <div v-else class="timeline-list">
          <div v-for="change in filteredChanges" :key="change._id" class="border rounded p-3 mb-3">
            <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
              <div>
                <h5 class="mb-1">{{ change.target_name }} - {{ change.section }}</h5>
                <div class="small text-muted">{{ change.patch_note?.name }} • {{ change.patch_note?.version || 'No version' }} • {{ formatDate(change.patch_note?.published_at) }}</div>
              </div>
              <div class="d-flex gap-2 align-items-start">
                <span class="badge" :class="badgeClass(change.change_type)">{{ change.change_type }}</span>
                <span class="badge" :class="String(change.patch_note?.status || '').toUpperCase() === 'PUBLISHED' ? 'bg-success' : 'bg-secondary'">{{ change.patch_note?.status || 'DRAFT' }}</span>
              </div>
            </div>
            <p class="mb-2">{{ change.description }}</p>
            <div v-if="change.details?.length" class="table-responsive">
              <table class="table table-sm table-bordered mb-0">
                <thead class="table-light"><tr><th>Field</th><th>Old</th><th>New</th><th>Raw</th></tr></thead>
                <tbody><tr v-for="detail in change.details" :key="detail.raw_text"><td>{{ detail.field }}</td><td>{{ detail.old_value || '-' }}</td><td>{{ detail.new_value || '-' }}</td><td class="small">{{ detail.raw_text }}</td></tr></tbody>
              </table>
            </div>
          </div>
          <div v-if="filteredChanges.length === 0" class="text-center text-muted py-5">Belum ada history untuk filter ini.</div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

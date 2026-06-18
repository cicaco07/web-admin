<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import ModalButton from '../../components/Modal/ModalButton.vue';
import TablePagination from '../../components/Table/TablePagination.vue';
import AppSelect from '../../components/AppSelect.vue';
import type { SelectOption } from '../../components/AppSelect.vue';
import AuditLogDetailModal from './components/AuditLogDetailModal.vue';
import { useAuditLogs } from '../../lib/api/AuditLogApi';
import { useManagedUsers } from '../../lib/api/UserManagementApi';
import type { AuditLog, AuditLogFilterInput } from '../../types/AuditLog';
import { createDefaultAuditLogFilter, AUDIT_STATUS_OPTIONS } from '../../types/AuditLog';
import type { ManagedUser } from '../../types/UserManagement';

const token = localStorage.getItem('token') || '';

// Fetch all users to map user IDs to names
const { result: usersResult } = useManagedUsers(token);
const users = computed<ManagedUser[]>(() => usersResult.value?.getAllUsers || []);

const userMap = computed(() => {
  const map: Record<string, string> = {};
  users.value.forEach(u => {
    map[u._id] = u.name;
  });
  return map;
});

const getUserName = (userId: string | null) => {
  if (!userId) return '-';
  return userMap.value[userId] || userId;
};

// --- Filter state ---
const filter = ref<AuditLogFilterInput>(createDefaultAuditLogFilter());
const actionSearch = ref('');
const statusFilter = ref('');
const startDate = ref('');
const endDate = ref('');

const statusOptions = computed<SelectOption[]>(() =>
  AUDIT_STATUS_OPTIONS.map(o => ({ id: o.id, text: o.text }))
);

// Build reactive filter from UI controls
const activeFilter = computed<AuditLogFilterInput>(() => {
  const f: AuditLogFilterInput = {
    page: filter.value.page,
    limit: filter.value.limit,
  };
  if (actionSearch.value.trim()) f.action = actionSearch.value.trim();
  if (statusFilter.value === 'true') f.success = true;
  else if (statusFilter.value === 'false') f.success = false;
  if (startDate.value) f.startDate = new Date(startDate.value).toISOString();
  if (endDate.value) f.endDate = new Date(endDate.value + 'T23:59:59').toISOString();
  return f;
});

const { result, loading } = useAuditLogs(token, activeFilter);

const logs = computed<AuditLog[]>(() => result.value?.auditLogs?.items || []);
const totalCount = computed<number>(() => result.value?.auditLogs?.totalCount || 0);

// Reset page to 1 when any filter changes
watch([actionSearch, statusFilter, startDate, endDate], () => {
  filter.value.page = 1;
});

const resetFilters = () => {
  actionSearch.value = '';
  statusFilter.value = '';
  startDate.value = '';
  endDate.value = '';
  filter.value = createDefaultAuditLogFilter();
};

// --- Detail modal ---
const selectedLog = ref<AuditLog | null>(null);
const openDetail = (log: AuditLog) => {
  selectedLog.value = log;
};

// --- Formatters ---
const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const truncate = (value: string | null, maxLength = 50) => {
  if (!value) return '-';
  return value.length > maxLength ? value.substring(0, maxLength) + '…' : value;
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Audit Logs"
      :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Audit Logs' }]"
    />

    <div class="card">
      <div class="border-bottom title-part-padding">
        <h4 class="card-title mb-0">
          <i class="ti ti-history me-2"></i>Riwayat Aktivitas
        </h4>
      </div>
      <div class="card-body">
        <!-- Filter Bar -->
        <div class="row mb-3 g-2">
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Action</label>
            <div class="input-group">
              <span class="input-group-text bg-primary text-white">
                <i class="ti ti-search"></i>
              </span>
              <input
                v-model="actionSearch"
                class="form-control"
                placeholder="Cari action..."
              />
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Status</label>
            <AppSelect
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="Semua Status"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Dari Tanggal</label>
            <input
              v-model="startDate"
              type="date"
              class="form-control"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Sampai Tanggal</label>
            <input
              v-model="endDate"
              type="date"
              class="form-control"
            />
          </div>
          <div class="col-md-1 d-flex align-items-end">
            <button
              class="btn btn-outline-secondary w-100"
              @click="resetFilters"
              title="Reset Filter"
            >
              <i class="ti ti-refresh"></i>
            </button>
          </div>
        </div>

        <!-- Detail Modal -->
        <AuditLogDetailModal
          modalId="audit-log-detail"
          :log="selectedLog"
          :userName="selectedLog ? getUserName(selectedLog.user) : '-'"
        />

        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr class="text-center">
                <th>No</th>
                <th>User</th>
                <th>Action</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Waktu</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">Memuat data audit log...</td>
              </tr>
              <tr
                v-for="(log, index) in logs"
                :key="log._id"
                class="text-center align-middle"
                v-show="!loading"
              >
                <td>{{ (filter.page - 1) * filter.limit + index + 1 }}</td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 150px;" :title="log.user || '-'">
                    {{ getUserName(log.user) }}
                  </span>
                </td>
                <td>
                  <code class="text-primary">{{ log.action }}</code>
                </td>
                <td>{{ log.ipAddress }}</td>
                <td>
                  <span
                    class="badge"
                    :class="log.success ? 'bg-light-success text-success' : 'bg-light-danger text-danger'"
                  >
                    <i class="ti me-1" :class="log.success ? 'ti-check' : 'ti-x'"></i>
                    {{ log.success ? 'Berhasil' : 'Gagal' }}
                  </span>
                </td>
                <td class="text-nowrap">{{ formatDate(log.createdAt) }}</td>
                <td>
                  <ModalButton
                    variant="info"
                    font="medium"
                    size="sm"
                    dataBsTarget="audit-log-detail"
                    @click="openDetail(log)"
                  >
                    <i class="ti ti-eye"></i>
                  </ModalButton>
                </td>
              </tr>
              <tr v-if="!loading && logs.length === 0">
                <td colspan="7" class="text-center text-muted py-4">Tidak ada data audit log</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <TablePagination
          v-if="!loading && totalCount > 0"
          v-model:currentPage="filter.page"
          v-model:itemsPerPage="filter.limit"
          :totalItems="totalCount"
          :pageSizeOptions="[10, 20, 50]"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

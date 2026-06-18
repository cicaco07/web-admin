<script setup lang="ts">
import Modal from '../../../components/Modal/Modal.vue';
import ModalHeader from '../../../components/Modal/ModalHeader.vue';
import type { AuditLog } from '../../../types/AuditLog';

const props = defineProps<{
  modalId: string;
  log: AuditLog | null;
  userName: string;
}>();

const formatJson = (raw: string | null): string => {
  if (!raw) return '-';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
</script>

<template>
  <Modal :id="props.modalId" size="xl">
    <ModalHeader backgroundColor="info">
      <i class="ti ti-file-text me-2"></i>Detail Audit Log
    </ModalHeader>
    <div class="modal-body" v-if="props.log">
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card border shadow-none mb-0">
            <div class="card-body p-3">
              <small class="text-muted d-block mb-1">Action</small>
              <span class="fw-semibold fs-4">
                <code>{{ props.log.action }}</code>
              </span>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border shadow-none mb-0">
            <div class="card-body p-3">
              <small class="text-muted d-block mb-1">Status</small>
              <span
                class="badge fs-3"
                :class="props.log.success ? 'bg-light-success text-success' : 'bg-light-danger text-danger'"
              >
                <i class="ti me-1" :class="props.log.success ? 'ti-check' : 'ti-x'"></i>
                {{ props.log.success ? 'Berhasil' : 'Gagal' }}
              </span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border shadow-none mb-0">
            <div class="card-body p-3">
              <small class="text-muted d-block mb-1">User</small>
              <span class="fw-semibold" :title="props.log.user || ''">{{ props.userName }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border shadow-none mb-0">
            <div class="card-body p-3">
              <small class="text-muted d-block mb-1">IP Address</small>
              <span class="fw-semibold">{{ props.log.ipAddress }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border shadow-none mb-0">
            <div class="card-body p-3">
              <small class="text-muted d-block mb-1">Waktu</small>
              <span class="fw-semibold">{{ formatDate(props.log.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!props.log.success && props.log.errorMessage" class="alert alert-danger d-flex align-items-start mb-4">
        <i class="ti ti-alert-circle fs-5 me-2 mt-1"></i>
        <div>
          <strong>Error Message</strong>
          <p class="mb-0 mt-1">{{ props.log.errorMessage }}</p>
        </div>
      </div>

      <div class="mb-4">
        <h6 class="fw-semibold mb-2">
          <i class="ti ti-upload me-1"></i>Input Data
        </h6>
        <pre class="audit-log-json bg-light rounded p-3 mb-0">{{ formatJson(props.log.inputData) }}</pre>
      </div>

      <div class="mb-2">
        <h6 class="fw-semibold mb-2">
          <i class="ti ti-download me-1"></i>Result Data
        </h6>
        <pre class="audit-log-json bg-light rounded p-3 mb-0">{{ formatJson(props.log.resultData) }}</pre>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
    </div>
  </Modal>
</template>

<style scoped>
.audit-log-json {
  max-height: 350px;
  overflow: auto;
  font-size: 0.8rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  border: 1px solid #dfe5ef;
}
</style>

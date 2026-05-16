<script setup lang="ts">
import { ref, computed } from 'vue';
import Modal from './Modal.vue';
import ModalHeader from './ModalHeader.vue';
import Button from '../Button/Button.vue';

interface Props {
  modalId: string;
  title: string;
  templateFileName: string;
  templateHint?: string;
  uploadHint?: string;
  isImporting?: boolean;
  onDownloadTemplate: () => void;
  onUpload: (file: File) => Promise<void> | void;
}

const props = defineProps<Props>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const errorMessage = ref('');

const isImporting = computed(() => props.isImporting ?? false);

const onFileChange = (e: Event) => {
  errorMessage.value = '';
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  if (!file) {
    selectedFile.value = null;
    return;
  }
  const lower = file.name.toLowerCase();
  if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
    errorMessage.value = 'Hanya file Excel (.xlsx / .xls) yang diperbolehkan.';
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    return;
  }
  selectedFile.value = file;
};

const triggerBrowse = () => {
  fileInput.value?.click();
};

const clearFile = () => {
  selectedFile.value = null;
  errorMessage.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const submit = async () => {
  if (!selectedFile.value) {
    errorMessage.value = 'Pilih file Excel terlebih dahulu.';
    return;
  }
  try {
    await props.onUpload(selectedFile.value);
    clearFile();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal mengimpor data.';
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
</script>

<template>
  <Modal :id="modalId" size="lg">
    <ModalHeader backgroundColor="info">{{ title }}</ModalHeader>
    <div class="modal-body text-start">
      <div class="card-body p-2">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card border h-100 shadow-sm">
              <div class="card-body d-flex flex-column">
                <div class="d-flex align-items-center mb-2">
                  <div
                    class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-2"
                    style="width: 40px; height: 40px;"
                  >
                    <i class="ti ti-download fs-4"></i>
                  </div>
                  <h5 class="mb-0">1. Unduh Template</h5>
                </div>
                <p class="text-muted small mb-3">
                  {{ templateHint || 'Unduh template Excel sebagai contoh format data yang valid sebelum mengimpor.' }}
                </p>
                <div class="bg-light rounded p-2 mb-3 small text-muted">
                  <i class="ti ti-file-spreadsheet me-1 text-success"></i>
                  <span class="fw-semibold">{{ templateFileName }}</span>
                </div>
                <div class="mt-auto">
                  <Button
                    variant="primary"
                    class="w-100"
                    :onClick="onDownloadTemplate"
                    :disabled="isImporting"
                  >
                    <i class="ti ti-file-download me-1"></i>
                    Unduh Template
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card border h-100 shadow-sm">
              <div class="card-body d-flex flex-column">
                <div class="d-flex align-items-center mb-2">
                  <div
                    class="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center me-2"
                    style="width: 40px; height: 40px;"
                  >
                    <i class="ti ti-upload fs-4"></i>
                  </div>
                  <h5 class="mb-0">2. Unggah File</h5>
                </div>
                <p class="text-muted small mb-3">
                  {{ uploadHint || 'Pilih file Excel yang sudah diisi sesuai template untuk mengimpor data.' }}
                </p>

                <div
                  class="border border-2 border-dashed rounded p-3 text-center mb-3 flex-grow-1 d-flex flex-column justify-content-center"
                  :class="{ 'border-success bg-success-subtle': selectedFile, 'border-secondary': !selectedFile }"
                  style="cursor: pointer; min-height: 110px;"
                  @click="triggerBrowse"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    class="d-none"
                    accept=".xlsx,.xls"
                    @change="onFileChange"
                  />
                  <template v-if="selectedFile">
                    <i class="ti ti-file-check text-success fs-1"></i>
                    <div class="fw-semibold text-truncate">{{ selectedFile.name }}</div>
                    <div class="small text-muted">{{ formatBytes(selectedFile.size) }}</div>
                  </template>
                  <template v-else>
                    <i class="ti ti-cloud-upload fs-1 text-muted"></i>
                    <div class="small text-muted">Klik untuk memilih file</div>
                    <div class="small text-muted">Format: .xlsx, .xls</div>
                  </template>
                </div>

                <div v-if="errorMessage" class="alert alert-danger py-2 small mb-2">
                  <i class="ti ti-alert-circle me-1"></i>
                  {{ errorMessage }}
                </div>

                <div class="d-flex gap-2 mt-auto">
                  <Button
                    variant="outline-secondary"
                    class="flex-grow-1"
                    :onClick="clearFile"
                    :disabled="isImporting || !selectedFile"
                  >
                    <i class="ti ti-x me-1"></i>
                    Reset
                  </Button>
                  <Button
                    variant="success"
                    class="flex-grow-1"
                    :onClick="submit"
                    :disabled="isImporting || !selectedFile"
                    :loading="isImporting"
                  >
                    <i class="ti ti-database-import me-1"></i>
                    Impor Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="alert alert-warning mt-3 mb-0 py-2 small">
          <i class="ti ti-info-circle me-1"></i>
          <strong>Catatan:</strong> pastikan struktur kolom dan nama sheet pada file unggahan sama persis seperti template.
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="isImporting">
        Tutup
      </button>
    </div>
  </Modal>
</template>

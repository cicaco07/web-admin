<script setup lang="ts">
import { computed, ref } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Emblem Components
import EmblemFormModal from './components/EmblemFormModal.vue';
import EmblemDetailModal from './components/EmblemDetailModal.vue';

// API & Services
import { useEmblems } from '../../../lib/api/EmblemApi';
import { useEmblemService } from '../../../lib/service/EmblemService';

// Types
import type { Emblem, EmblemFormData, EmblemAttribute } from '../../../types/Emblem';
import { createDefaultEmblemForm, EMBLEM_TYPE_OPTIONS } from '../../../types/Emblem';

// ==================== Data Fetching ====================
const { result: emblemResult, loading: emblemLoading, refetch } = useEmblems();
const emblems = computed(() => emblemResult.value?.emblems || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddEmblem, handleEditEmblem, handleDeleteEmblem } = useEmblemService(safeRefetch);

// ==================== Search & Filter ====================
const searchQuery = ref('');
const selectedFilterType = ref('');

const filteredEmblems = computed(() => {
  let filtered = emblems.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(emblem => 
      emblem.name.toLowerCase().includes(query) ||
      emblem.type.toLowerCase().includes(query) ||
      (emblem.benefit && emblem.benefit.toLowerCase().includes(query)) ||
      (emblem.description && emblem.description.toLowerCase().includes(query))
    );
  }

  // Filter by type
  if (selectedFilterType.value) {
    filtered = filtered.filter(emblem => emblem.type === selectedFilterType.value);
  }

  return filtered;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedEmblems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredEmblems.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const emblemForm = ref<EmblemFormData>(createDefaultEmblemForm());
const editEmblemForm = ref<EmblemFormData>(createDefaultEmblemForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);

// ==================== Detail Modal State ====================
const selectedEmblem = ref<Emblem | null>(null);

// ==================== Form Actions ====================
const resetForm = () => {
  emblemForm.value = createDefaultEmblemForm();
};

const resetEditForm = () => {
  editEmblemForm.value = createDefaultEmblemForm();
};

const openEditModal = (emblem: Emblem) => {
  editEmblemForm.value = {
    _id: emblem._id,
    name: emblem.name,
    type: emblem.type,
    icon: emblem.icon,
    attributes: emblem.attributes || [],
    benefit: emblem.benefit,
    description: emblem.description,
    cooldown: emblem.cooldown
  };
};

const openDetailModal = (emblem: Emblem) => {
  selectedEmblem.value = emblem;
};

// ==================== Submit Handlers ====================
const onAddEmblem = async (attributes: EmblemAttribute[]) => {
  isSubmitting.value = true;
  try {
    const formData = { ...emblemForm.value, attributes };
    await handleAddEmblem(formData);
    resetForm();
  } catch (error) {
    console.error('Error adding emblem:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditEmblem = async (attributes: EmblemAttribute[]) => {
  isEditSubmitting.value = true;
  try {
    const formData = { ...editEmblemForm.value, attributes };
    await handleEditEmblem(formData);
    resetEditForm();
  } catch (error) {
    console.error('Error editing emblem:', error);
  } finally {
    isEditSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Emblem"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Persiapan' },
        { name: 'Emblem' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Emblem</h4>
          </div>

          <div class="card-body">
            <!-- Search & Filter Section -->
            <div class="row mb-3">
              <div class="col-md-8">
                <div class="input-group">
                  <span class="input-group-text bg-primary text-white">
                    <i class="ti ti-search"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Cari nama, tipe, benefit, atau deskripsi..."
                    v-model="searchQuery"
                    @keyup="currentPage = 1"
                  >
                  <button 
                    v-if="searchQuery"
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="searchQuery = ''; currentPage = 1"
                  >
                    <i class="ti ti-x"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-2">
                <select 
                  class="form-select" 
                  v-model="selectedFilterType"
                  @change="currentPage = 1"
                >
                  <option value="">Semua Tipe</option>
                  <option 
                    v-for="type in EMBLEM_TYPE_OPTIONS" 
                    :key="type" 
                    :value="type"
                  >
                    {{ type }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <button 
                  class="btn btn-outline-secondary w-100"
                  @click="searchQuery = ''; selectedFilterType = ''; currentPage = 1"
                >
                  <i class="ti ti-refresh me-1"></i>
                  Reset Filter
                </button>
              </div>
            </div>

            <!-- Add Emblem Button -->
            <div class="row mb-3">
              <div class="col-md-12 d-flex justify-content-end">
                <ModalButton
                  variant="info"
                  font="medium"
                  size="lg"
                  dataBsTarget="add-emblem"
                >
                  <i class="ti ti-plus me-1"></i>
                  Tambah Emblem
                </ModalButton>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery || selectedFilterType" class="alert alert-info py-2 mb-3">
              <div class="d-flex align-items-center">
                <i class="ti ti-filter me-2"></i>
                <span>Menampilkan {{ filteredEmblems.length }} dari {{ emblems.length }} emblem</span>
                <span v-if="searchQuery" class="ms-2">
                  | Pencarian: <strong>{{ searchQuery }}</strong>
                </span>
                <span v-if="selectedFilterType" class="ms-2">
                  | Tipe: <strong>{{ selectedFilterType }}</strong>
                </span>
              </div>
            </div>

            <!-- Add Modal -->
            <EmblemFormModal
              modalId="add-emblem"
              title="Tambah Data Emblem"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :emblemForm="emblemForm"
              @update:emblemForm="emblemForm = $event"
              @submit="onAddEmblem"
              @cancel="resetForm"
            />

            <!-- Edit Modal -->
            <EmblemFormModal
              modalId="edit-emblem"
              title="Edit Data Emblem"
              headerColor="warning"
              :isSubmitting="isEditSubmitting"
              :emblemForm="editEmblemForm"
              @update:emblemForm="editEmblemForm = $event"
              @submit="onEditEmblem"
              @cancel="resetEditForm"
            />

            <!-- Detail Modal -->
            <EmblemDetailModal
              modalId="detail-emblem"
              :emblem="selectedEmblem"
            />

            <!-- Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th style="width: 80px;">Icon</th>
                    <th>Nama</th>
                    <th>Tipe</th>
                    <th>Benefit</th>
                    <th style="width: 200px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loading State -->
                  <tr v-if="emblemLoading">
                    <td colspan="6" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data emblem...
                      </div>
                    </td>
                  </tr>

                  <!-- Emblem Data Rows -->
                  <tr 
                    v-for="(emblem, index) in paginatedEmblems" 
                    :key="emblem._id" 
                    class="text-center align-middle"
                    v-show="!emblemLoading"
                  >
                    <td>{{ getRowNumber(Number(index)) }}</td>
                    <td>
                      <img 
                        :src="emblem.icon" 
                        alt="Icon" 
                        class="img-fluid" 
                        style="width: 50px; height: 50px; object-fit: contain;" 
                      />
                    </td>
                    <td>{{ emblem.name }}</td>
                    <td>{{ emblem.type }}</td>
                    <td>{{ emblem.benefit || '-' }}</td>
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <!-- Detail Button -->
                        <ModalButton
                          variant="secondary"
                          font="medium"
                          size="sm"
                          dataBsTarget="detail-emblem"
                          @click="openDetailModal(emblem)"
                        >
                          <i class="ti ti-eye"></i>
                        </ModalButton>

                        <!-- Edit Button -->
                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          dataBsTarget="edit-emblem"
                          @click="openEditModal(emblem)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <!-- Delete Button -->
                        <Button
                          variant="danger"
                          font="medium"
                          size="sm"
                          type="button"
                          @click="handleDeleteEmblem(emblem._id)"
                          class="px-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!emblemLoading && paginatedEmblems.length === 0 && emblems.length > 0">
                    <td colspan="6" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada emblem yang sesuai dengan filter
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!emblemLoading && emblems.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data emblem
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="!emblemLoading && filteredEmblems.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredEmblems.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

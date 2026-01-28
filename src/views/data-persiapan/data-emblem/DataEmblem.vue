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
import { createDefaultEmblemForm } from '../../../types/Emblem';

// ==================== Data Fetching ====================
const { result: emblemResult, refetch } = useEmblems();
const emblems = computed(() => emblemResult.value?.emblems || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddEmblem, handleEditEmblem, handleDeleteEmblem } = useEmblemService(safeRefetch);

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedEmblems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return emblems.value.slice(start, end);
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
            <!-- Add Button -->
            <div class="d-flex justify-content-end mb-3">
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
                  <tr 
                    v-for="(emblem, index) in paginatedEmblems" 
                    :key="emblem._id" 
                    class="text-center align-middle"
                  >
                    <td>{{ getRowNumber(index) }}</td>
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

                  <!-- Empty State -->
                  <tr v-if="emblems.length === 0">
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
              v-if="emblems.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="emblems.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

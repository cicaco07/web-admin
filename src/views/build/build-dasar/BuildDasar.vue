<script setup lang="ts">
import { computed, ref } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Build Components
import BuildFormModal from './components/BuildFormModal.vue';
import BuildDetailModal from './components/BuildDetailModal.vue';

// API & Services
import { useBuilds } from '../../../lib/api/BuildApi';
import { useBuildService } from '../../../lib/service/BuildService';

// Types
import type { Build, BuildFormData } from '../../../types/Build';
import { createDefaultBuildForm, ROLE_OPTIONS } from '../../../types/Build';

// ==================== Data Fetching ====================
const { result: buildResult, loading: buildLoading, refetch } = useBuilds();
const builds = computed<Build[]>(() => buildResult.value?.builds || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddBuild, handleEditBuild, handleDeleteBuild } = useBuildService(safeRefetch);

// ==================== Search & Filter ====================
const searchQuery = ref('');
const selectedFilterRole = ref('');
const selectedFilterOfficial = ref('');

const filteredBuilds = computed<Build[]>(() => {
  let filtered = builds.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((build: Build) => 
      build.name.toLowerCase().includes(query) ||
      build.role.toLowerCase().includes(query) ||
      build.hero.name.toLowerCase().includes(query) ||
      build.user.name.toLowerCase().includes(query)
    );
  }

  // Filter by role
  if (selectedFilterRole.value) {
    filtered = filtered.filter((build: Build) => build.role === selectedFilterRole.value);
  }

  // Filter by official status
  if (selectedFilterOfficial.value) {
    const isOfficial = selectedFilterOfficial.value === 'official';
    filtered = filtered.filter((build: Build) => build.is_official === isOfficial);
  }

  return filtered;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedBuilds = computed<Build[]>(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBuilds.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const buildForm = ref<BuildFormData>(createDefaultBuildForm());
const editBuildForm = ref<BuildFormData>(createDefaultBuildForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);

// ==================== Detail Modal State ====================
const selectedBuild = ref<Build | null>(null);

// ==================== Form Actions ====================
const resetForm = () => {
  buildForm.value = createDefaultBuildForm();
};

const resetEditForm = () => {
  editBuildForm.value = createDefaultBuildForm();
};

const openEditModal = (build: Build) => {
  editBuildForm.value = {
    _id: build._id,
    name: build.name,
    role: build.role,
    description: build.description || '',
    heroId: build.hero._id,
    items: build.items.map(item => ({
      itemId: item.item._id,
      order: item.order
    })),
    emblemIds: build.emblems.map(emblem => emblem._id),
    battleSpellIds: build.battle_spells.map(spell => spell._id)
  };
};

const openDetailModal = (build: Build) => {
  selectedBuild.value = build;
};

// ==================== Submit Handlers ====================
const onAddBuild = async () => {
  isSubmitting.value = true;
  try {
    await handleAddBuild(buildForm.value);
    resetForm();
  } catch (error) {
    console.error('Error adding build:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditBuild = async () => {
  isEditSubmitting.value = true;
  try {
    await handleEditBuild(editBuildForm.value);
    resetEditForm();
  } catch (error) {
    console.error('Error editing build:', error);
  } finally {
    isEditSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Build Dasar"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Build' },
        { name: 'Build Dasar' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Build</h4>
          </div>

          <div class="card-body">
            <!-- Search & Filter Section -->
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text bg-primary text-white">
                    <i class="ti ti-search"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Cari nama build, role, hero, atau pembuat..."
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
                  v-model="selectedFilterRole"
                  @change="currentPage = 1"
                >
                  <option value="">Semua Role</option>
                  <option 
                    v-for="role in ROLE_OPTIONS" 
                    :key="role" 
                    :value="role"
                  >
                    {{ role }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <select 
                  class="form-select" 
                  v-model="selectedFilterOfficial"
                  @change="currentPage = 1"
                >
                  <option value="">Semua Status</option>
                  <option value="official">Official</option>
                  <option value="community">Community</option>
                </select>
              </div>
              <div class="col-md-2">
                <button 
                  class="btn btn-outline-secondary w-100"
                  @click="searchQuery = ''; selectedFilterRole = ''; selectedFilterOfficial = ''; currentPage = 1"
                >
                  <i class="ti ti-refresh me-1"></i>
                  Reset Filter
                </button>
              </div>
            </div>

            <!-- Add Build Button -->
            <div class="row mb-3">
              <div class="col-md-12 d-flex justify-content-end">
                <ModalButton
                  variant="info"
                  font="medium"
                  size="lg"
                  dataBsTarget="add-build"
                >
                  <i class="ti ti-plus me-1"></i>
                  Tambah Build
                </ModalButton>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery || selectedFilterRole || selectedFilterOfficial" class="alert alert-info py-2 mb-3">
              <div class="d-flex align-items-center">
                <i class="ti ti-filter me-2"></i>
                <span>Menampilkan {{ filteredBuilds.length }} dari {{ builds.length }} build</span>
                <span v-if="searchQuery" class="ms-2">
                  | Pencarian: <strong>{{ searchQuery }}</strong>
                </span>
                <span v-if="selectedFilterRole" class="ms-2">
                  | Role: <strong>{{ selectedFilterRole }}</strong>
                </span>
                <span v-if="selectedFilterOfficial" class="ms-2">
                  | Status: <strong>{{ selectedFilterOfficial === 'official' ? 'Official' : 'Community' }}</strong>
                </span>
              </div>
            </div>

            <!-- Add Modal -->
            <BuildFormModal
              modalId="add-build"
              title="Tambah Build Dasar"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :buildForm="buildForm"
              @update:buildForm="buildForm = $event"
              @submit="onAddBuild"
              @cancel="resetForm"
            />

            <!-- Edit Modal -->
            <BuildFormModal
              modalId="edit-build"
              title="Edit Build Dasar"
              headerColor="warning"
              :isSubmitting="isEditSubmitting"
              :buildForm="editBuildForm"
              @update:buildForm="editBuildForm = $event"
              @submit="onEditBuild"
              @cancel="resetEditForm"
            />

            <!-- Detail Modal -->
            <BuildDetailModal
              modalId="detail-build"
              :build="selectedBuild"
            />

            <!-- Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Nama Build</th>
                    <th>Hero</th>
                    <th>Role</th>
                    <th style="width: 100px;">Items</th>
                    <th>Pembuat</th>
                    <th style="width: 100px;">Status</th>
                    <th style="width: 200px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loading State -->
                  <tr v-if="buildLoading">
                    <td colspan="8" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data build...
                      </div>
                    </td>
                  </tr>

                  <!-- Build Data Rows -->
                  <tr 
                    v-for="(build, index) in paginatedBuilds" 
                    :key="build._id" 
                    class="text-center align-middle"
                    v-show="!buildLoading"
                  >
                    <td>{{ getRowNumber(index) }}</td>
                    <td class="text-start">{{ build.name }}</td>
                    <td>
                      <div class="d-flex align-items-center justify-content-center">
                        <img 
                          :src="build.hero.image" 
                          :alt="build.hero.name" 
                          class="img-fluid me-2" 
                          style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" 
                        />
                        <span>{{ build.hero.name }}</span>
                      </div>
                    </td>
                    <td>{{ build.role }}</td>
                    <td>{{ build.items.length }}</td>
                    <td>{{ build.user.name }}</td>
                    <td>
                      <span 
                        class="badge"
                        :class="build.is_official ? 'bg-success' : 'bg-info'"
                      >
                        {{ build.is_official ? 'Official' : 'Community' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <!-- Detail Button -->
                        <ModalButton
                          variant="secondary"
                          font="medium"
                          size="sm"
                          dataBsTarget="detail-build"
                          @click="openDetailModal(build)"
                        >
                          <i class="ti ti-eye"></i>
                        </ModalButton>

                        <!-- Edit Button -->
                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          dataBsTarget="edit-build"
                          @click="openEditModal(build)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <!-- Delete Button -->
                        <Button
                          variant="danger"
                          font="medium"
                          size="sm"
                          type="button"
                          @click="handleDeleteBuild(build._id)"
                          class="px-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!buildLoading && paginatedBuilds.length === 0 && builds.length > 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada build yang sesuai dengan filter
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!buildLoading && builds.length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data build
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="!buildLoading && filteredBuilds.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredBuilds.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

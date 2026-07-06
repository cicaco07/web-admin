<script setup lang="ts">
import { ref, computed } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import Badge from '../../../components/Badge/Badge.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import ImportModal from '../../../components/Modal/ImportModal.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';
import AppSelect from '../../../components/AppSelect.vue';
import type { SelectOption } from '../../../components/AppSelect.vue';

// Hero Components
import HeroDetailModal from './components/HeroDetailModal.vue';
import HeroFormModal from './components/HeroFormModal.vue';

// API & Services
import { useHeroes, useCreateHero, useUpdateHero } from '../../../lib/api/HeroApi';
import { useHeroService } from '../../../lib/service/HeroService';
import { alertSuccess, alertError } from '../../../lib/alert';
import { downloadHeroTemplate, exportHeroes, parseHeroFile } from '../../../lib/excel/hero.excel';

// Types
import type { Hero, HeroFormData } from '../../../types/Hero';
import { createDefaultHeroForm, HERO_TYPE_OPTIONS, HERO_ROLE_OPTIONS } from '../../../types/Hero';

// ==================== Data Fetching ====================
const { result: heroResult, loading: heroLoading, refetch } = useHeroes();
const heroes = computed<Hero[]>(() => heroResult.value?.heroes?.items || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddHero, handleEditHero, handleDeleteHero } = useHeroService(safeRefetch);

// ==================== Search & Filter ====================
const searchQuery = ref('');
const selectedFilterRole = ref('');
const selectedFilterType = ref('');

const roleFilterSelectOptions = computed<SelectOption[]>(() => [
  { id: '', text: 'Semua Role' },
  ...HERO_ROLE_OPTIONS.map(role => ({ id: role, text: role })),
]);

const typeFilterSelectOptions = computed<SelectOption[]>(() => [
  { id: '', text: 'Semua Tipe' },
  ...HERO_TYPE_OPTIONS.map(type => ({ id: type, text: type })),
]);

const filteredHeroes = computed(() => {
  let filtered = heroes.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(hero => 
      hero.name.toLowerCase().includes(query) ||
      hero.alias.toLowerCase().includes(query) ||
      hero.speciality.toLowerCase().includes(query) ||
      hero.region.toLowerCase().includes(query)
    );
  }

  // Filter by role
  if (selectedFilterRole.value) {
    filtered = filtered.filter(hero => 
      Array.isArray(hero.role) 
        ? hero.role.includes(selectedFilterRole.value)
        : hero.role === selectedFilterRole.value
    );
  }

  // Filter by type
  if (selectedFilterType.value) {
    filtered = filtered.filter(hero => 
      Array.isArray(hero.type) 
        ? hero.type.includes(selectedFilterType.value)
        : hero.type === selectedFilterType.value
    );
  }

  return filtered;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedHeroes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredHeroes.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const heroForm = ref<HeroFormData>(createDefaultHeroForm());
const selectedRolesAdd = ref<string[]>([]);
const selectedTypesAdd = ref<string[]>([]);
const selectedRolesEdit = ref<string[]>([]);
const selectedTypesEdit = ref<string[]>([]);
const isSubmitting = ref(false);

// ==================== Form Actions ====================
const resetForm = () => {
  heroForm.value = createDefaultHeroForm();
  selectedRolesAdd.value = [];
  selectedTypesAdd.value = [];
  selectedRolesEdit.value = [];
  selectedTypesEdit.value = [];
};

const openEditModal = (hero: Hero) => {
  heroForm.value = { ...hero };
  selectedRolesEdit.value = Array.isArray(hero.role) ? [...hero.role] : hero.role ? [hero.role] : [];
  selectedTypesEdit.value = Array.isArray(hero.type) ? [...hero.type] : hero.type ? [hero.type] : [];
};

const onAddHero = async () => {
  isSubmitting.value = true;
  try {
    await handleAddHero(heroForm.value, selectedRolesAdd.value, selectedTypesAdd.value);
    resetForm();
  } catch (error) {
    console.error('Error adding hero:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditHero = async () => {
  isSubmitting.value = true;
  try {
    await handleEditHero(heroForm.value, selectedRolesEdit.value, selectedTypesEdit.value);
    resetForm();
  } finally {
    isSubmitting.value = false;
  }
};

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedFilterRole.value) count++;
  if (selectedFilterType.value) count++;
  return count;
});

const toArray = (value: string | string[]): string[] => (Array.isArray(value) ? value : value ? [value] : []);

const resetFilters = () => {
  searchQuery.value = '';
  selectedFilterRole.value = '';
  selectedFilterType.value = '';
  currentPage.value = 1;
};

const handleExport = () => {
  if (heroes.value.length === 0) {
    alertError('Tidak ada data hero untuk diekspor.');
    return;
  }
  exportHeroes(filteredHeroes.value.length ? filteredHeroes.value : heroes.value);
};

const handleDownloadTemplate = downloadHeroTemplate;

// ==================== Import from Excel ====================
const isImporting = ref(false);
const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
const { createHero } = useCreateHero(token);
const { updateHero } = useUpdateHero(token);

const handleImport = async (file: File) => {
  isImporting.value = true;
  try {
    const inputs = await parseHeroFile(file);

    let createCount = 0;
    let updateCount = 0;
    let failCount = 0;
    const failures: string[] = [];

    for (const input of inputs) {
      try {
        const existing = heroes.value.find((hero) => hero.name.toLowerCase() === input.name.toLowerCase());
        if (existing) {
          await updateHero({ id: existing._id, updateHeroInput: input });
          updateCount++;
        } else {
          await createHero({ createHeroInput: input });
          createCount++;
        }
      } catch (err) {
        failCount++;
        failures.push(`${input.name || '(tanpa nama)'}: ${err instanceof Error ? err.message : 'gagal'}`);
      }
    }

    await safeRefetch();

    const successCount = createCount + updateCount;
    if (failCount === 0) {
      alertSuccess(`Berhasil mengimpor ${successCount} hero (${createCount} baru, ${updateCount} update).`);
    } else if (successCount === 0) {
      alertError(`Gagal mengimpor semua data. Detail: ${failures.slice(0, 3).join(' | ')}`);
    } else {
      alertSuccess(`Impor selesai: ${successCount} berhasil (${createCount} baru, ${updateCount} update), ${failCount} gagal.`);
    }
  } catch (err) {
    alertError(err instanceof Error ? err.message : 'Gagal memproses file.');
    throw err;
  } finally {
    isImporting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Hero"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Hero' },
        { name: 'Hero' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Hero</h4>
          </div>

          <div class="card-body">
            <!-- Toolbar: Search + Action Buttons -->
            <div class="row g-2 mb-3 align-items-stretch">
              <div class="col-12 col-lg-5">
                <div class="input-group h-100">
                  <span class="input-group-text bg-primary text-white">
                    <i class="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Cari nama, alias, spesialitas, atau region..."
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
              <div class="col-12 col-lg-7">
                <div class="row g-2 hero-action-row">
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-success w-100 hero-action-btn"
                      @click="handleExport"
                    >
                      <i class="ti ti-file-export me-1"></i>
                      Export Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-primary w-100 hero-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#import-hero"
                    >
                      <i class="ti ti-file-import me-1"></i>
                      Import Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-outline-secondary w-100 hero-action-btn position-relative"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#hero-filter-offcanvas"
                      aria-controls="hero-filter-offcanvas"
                    >
                      <i class="ti ti-adjustments-horizontal me-1"></i>
                      Filter
                      <span
                        v-if="activeFilterCount > 0"
                        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      >
                        {{ activeFilterCount }}
                      </span>
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-info w-100 hero-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#add-hero"
                    >
                      <i class="ti ti-plus me-1"></i>
                      Tambah Hero
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery || selectedFilterRole || selectedFilterType" class="alert alert-info py-2 mb-3 d-flex align-items-center flex-wrap gap-2">
              <i class="ti ti-filter"></i>
              <span>Menampilkan <strong>{{ filteredHeroes.length }}</strong> dari <strong>{{ heroes.length }}</strong> hero</span>
              <span v-if="searchQuery" class="badge bg-primary-subtle text-primary">
                Pencarian: {{ searchQuery }}
              </span>
              <span v-if="selectedFilterRole" class="badge bg-warning-subtle text-warning">
                Role: {{ selectedFilterRole }}
              </span>
              <span v-if="selectedFilterType" class="badge bg-info-subtle text-info">
                Tipe: {{ selectedFilterType }}
              </span>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary ms-auto"
                @click="resetFilters"
              >
                <i class="ti ti-refresh me-1"></i> Reset
              </button>
            </div>

            <!-- Filter Offcanvas -->
            <div
              class="offcanvas offcanvas-end"
              tabindex="-1"
              id="hero-filter-offcanvas"
              aria-labelledby="hero-filter-offcanvas-label"
            >
              <div class="offcanvas-header border-bottom bg-light">
                <h5 class="offcanvas-title d-flex align-items-center" id="hero-filter-offcanvas-label">
                  <i class="ti ti-adjustments-horizontal me-2 text-primary"></i>
                  Filter Hero
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>
              <div class="offcanvas-body">
                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-shield me-1 text-warning"></i>
                    Role
                  </label>
                  <AppSelect v-model="selectedFilterRole" :options="roleFilterSelectOptions" placeholder="Semua Role" @change="currentPage = 1" />
                  <small class="text-muted">Pilih role spesifik untuk menyaring hero.</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-sword me-1 text-info"></i>
                    Tipe
                  </label>
                  <AppSelect v-model="selectedFilterType" :options="typeFilterSelectOptions" placeholder="Semua Tipe" @change="currentPage = 1" />
                  <small class="text-muted">Pilih tipe (class) hero yang ingin ditampilkan.</small>
                </div>

                <div class="alert alert-light border d-flex align-items-center small mb-0">
                  <i class="ti ti-info-circle me-2 text-primary"></i>
                  Filter akan diterapkan secara otomatis saat dipilih.
                </div>
              </div>
              <div class="offcanvas-footer border-top p-3 bg-light d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary flex-grow-1"
                  @click="resetFilters"
                >
                  <i class="ti ti-refresh me-1"></i>
                  Reset Filter
                </button>
                <button
                  type="button"
                  class="btn btn-primary flex-grow-1"
                  data-bs-dismiss="offcanvas"
                >
                  <i class="ti ti-check me-1"></i>
                  Selesai
                </button>
              </div>
            </div>

            <!-- Add Hero Modal -->
            <HeroFormModal
              modalId="add-hero"
              title="Tambah Data Hero"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :heroForm="heroForm"
              :selectedRoles="selectedRolesAdd"
              :selectedTypes="selectedTypesAdd"
              @update:heroForm="heroForm = $event"
              @update:selectedRoles="selectedRolesAdd = $event"
              @update:selectedTypes="selectedTypesAdd = $event"
              @submit="onAddHero"
              @cancel="resetForm"
            />

            <!-- Edit Hero Modal -->
            <HeroFormModal
              modalId="edit-hero"
              title="Edit Data Hero"
              headerColor="warning"
              :isSubmitting="isSubmitting"
              :heroForm="heroForm"
              :selectedRoles="selectedRolesEdit"
              :selectedTypes="selectedTypesEdit"
              @update:heroForm="heroForm = $event"
              @update:selectedRoles="selectedRolesEdit = $event"
              @update:selectedTypes="selectedTypesEdit = $event"
              @submit="onEditHero"
              @cancel="resetForm"
            />

            <!-- Import Hero Modal -->
            <ImportModal
              modalId="import-hero"
              title="Import Data Hero"
              templateFileName="template-data-hero.xlsx"
              templateHint="Template berisi 1 baris contoh dan sheet petunjuk pengisian. Pilihan Role/Tipe yang valid sudah dijelaskan pada sheet Petunjuk."
              uploadHint="Pastikan file mengikuti template. Kolom Role dan Tipe boleh berisi banyak nilai yang dipisahkan koma."
              :isImporting="isImporting"
              :onDownloadTemplate="handleDownloadTemplate"
              :onUpload="handleImport"
            />

            <!-- Heroes Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover m-t-30">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Nama</th>
                    <th style="width: 80px;">Avatar</th>
                    <th>Alias</th>
                    <th>Role</th>
                    <th>Tipe</th>
                    <th style="width: 200px;">Deskripsi Singkat</th>
                    <th style="width: 120px;">Tanggal Rilis</th>
                    <th style="width: 200px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loading State -->
                  <tr v-if="heroLoading">
                    <td colspan="9" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data hero...
                      </div>
                    </td>
                  </tr>

                  <!-- Hero Data Rows -->
                  <tr
                    v-for="(hero, index) in paginatedHeroes"
                    :key="hero._id"
                    class="text-center align-middle"
                    v-show="!heroLoading"
                  >
                    <td>{{ getRowNumber(index) }}</td>
                    <td class="fw-semibold">{{ hero.name }}</td>
                    <td>
                      <img 
                        :src="hero.avatar" 
                        :alt="hero.name"
                        class="rounded-circle" 
                        style="width: 50px; height: 50px; object-fit: cover;"
                      >
                    </td>
                    <td>The {{ hero.alias }}</td>
                    <td>
                      <Badge
                        v-for="(role, i) in toArray(hero.role)"
                        :key="i"
                        color="warning"
                        class="me-1"
                      >
                        {{ role }}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        v-for="(type, i) in toArray(hero.type)"
                        :key="i"
                        color="info"
                        class="me-1"
                      >
                        {{ type }}
                      </Badge>
                    </td>
                    <td class="text-start text-truncate" style="max-width: 200px;">
                      {{ hero.short_description }}
                    </td>
                    <td>{{ hero.release_date }}</td>
                    <td>
                      <div class="d-flex flex-wrap gap-1 justify-content-center">
                        <!-- Detail Button -->
                        <ModalButton 
                          variant="secondary"
                          font="medium"
                          size="sm"
                          :dataBsTarget="'detail-hero-' + hero._id"
                        >
                          <i class="ti ti-eye"></i>
                        </ModalButton>

                        <!-- Detail Modal -->
                        <HeroDetailModal 
                          :hero="hero" 
                          :modalId="'detail-hero-' + hero._id" 
                        />

                        <!-- Edit Button -->
                        <ModalButton
                          variant="warning"
                          dataBsTarget="edit-hero"
                          font="medium"
                          size="sm"
                          @click="openEditModal(hero)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <!-- Delete Button -->
                        <Button
                          variant="danger"
                          font="medium"
                          size="sm"
                          type="button"
                          @click="handleDeleteHero(hero._id)"
                          class="me-1 m-t-10 mb-2 px-3 fs-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!heroLoading && paginatedHeroes.length === 0 && heroes.length > 0">
                    <td colspan="9" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada hero yang sesuai dengan filter
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!heroLoading && heroes.length === 0">
                    <td colspan="9" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data hero
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="!heroLoading && filteredHeroes.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredHeroes.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.hero-action-row {
  height: 100%;
}

.hero-action-btn {
  height: 100%;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.offcanvas-footer {
  flex-shrink: 0;
}
</style>

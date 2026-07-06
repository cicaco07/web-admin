<script setup lang="ts">
import { computed, ref } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import ImportModal from '../../../components/Modal/ImportModal.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';
import AppSelect from '../../../components/AppSelect.vue';
import type { SelectOption } from '../../../components/AppSelect.vue';

// Base Stat Components
import BaseStatFormModal from './components/BaseStatFormModal.vue';
import BaseStatDetailModal from './components/BaseStatDetailModal.vue';

// API & Services
import { useBaseStats, useCreateBaseStat, useUpdateBaseStat } from '../../../lib/api/BaseStatApi';
import { useBaseStatService } from '../../../lib/service/BaseStatService';
import { useHeroes } from '../../../lib/api/HeroApi';
import { alertSuccess, alertError } from '../../../lib/alert';
import { downloadBaseStatTemplate, exportBaseStats, parseBaseStatFile } from '../../../lib/excel/baseStat.excel';

// Types
import type { BaseStat, BaseStatFormData } from '../../../types/BaseStat';
import { createDefaultBaseStatForm } from '../../../types/BaseStat';
import type { Hero } from '../../../types/Hero';
import { HERO_ROLE_OPTIONS } from '../../../types/Hero';

// ==================== Data Fetching ====================
const { result: baseStatResult, loading: baseStatLoading, refetch } = useBaseStats();
const { result: heroResult } = useHeroes();
const baseStats = computed<BaseStat[]>(() => baseStatResult.value?.baseStats || []);
const heroes = computed<Hero[]>(() => heroResult.value?.heroes?.items || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddBaseStat, handleEditBaseStat, handleDeleteBaseStat } = useBaseStatService(safeRefetch);

// ==================== Search ====================
const searchQuery = ref('');
const selectedFilterRole = ref('');
const selectedSortBy = ref<'' | 'hp' | 'physical_attack' | 'magic_power' | 'physical_defense' | 'magic_defense' | 'movement_speed'>('');
const selectedSortDir = ref<'desc' | 'asc'>('desc');

const SORT_OPTIONS = [
  { value: 'hp', label: 'HP' },
  { value: 'physical_attack', label: 'Physical Attack' },
  { value: 'magic_power', label: 'Magic Power' },
  { value: 'physical_defense', label: 'Physical Defense' },
  { value: 'magic_defense', label: 'Magic Defense' },
  { value: 'movement_speed', label: 'Movement Speed' },
] as const;

const roleFilterSelectOptions = computed<SelectOption[]>(() => [
  { id: '', text: 'Semua Role' },
  ...HERO_ROLE_OPTIONS.map(role => ({ id: role, text: role })),
]);

const sortBySelectOptions = computed<SelectOption[]>(() => [
  { id: '', text: 'Tidak ada (urutan default)' },
  ...SORT_OPTIONS.map(opt => ({ id: opt.value, text: opt.label })),
]);

const filteredBaseStats = computed<BaseStat[]>(() => {
  let filtered = baseStats.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((stat: BaseStat) =>
      stat._id.toLowerCase().includes(query) ||
      stat.hero.name.toLowerCase().includes(query) ||
      String(stat.hp).includes(query) ||
      String(stat.physical_attack).includes(query) ||
      String(stat.magic_power).includes(query)
    );
  }

  if (selectedFilterRole.value) {
    const role = selectedFilterRole.value;
    filtered = filtered.filter((stat: BaseStat) =>
      Array.isArray(stat.hero.role) ? stat.hero.role.includes(role) : stat.hero.role === role
    );
  }

  if (selectedSortBy.value) {
    const key = selectedSortBy.value;
    const dir = selectedSortDir.value === 'asc' ? 1 : -1;
    filtered = [...filtered].sort((a, b) => ((a[key] as number) - (b[key] as number)) * dir);
  }

  return filtered;
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedFilterRole.value) count++;
  if (selectedSortBy.value) count++;
  return count;
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedFilterRole.value = '';
  selectedSortBy.value = '';
  selectedSortDir.value = 'desc';
  currentPage.value = 1;
};

const sortLabel = computed(() => {
  if (!selectedSortBy.value) return '';
  const found = SORT_OPTIONS.find((o) => o.value === selectedSortBy.value);
  if (!found) return '';
  return `${found.label} (${selectedSortDir.value === 'asc' ? 'terkecil' : 'terbesar'})`;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedBaseStats = computed<BaseStat[]>(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBaseStats.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const baseStatForm = ref<BaseStatFormData>(createDefaultBaseStatForm());
const editBaseStatForm = ref<BaseStatFormData>(createDefaultBaseStatForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);

// ==================== Detail Modal State ====================
const selectedBaseStat = ref<BaseStat | null>(null);

const assignedHeroIds = computed(() => new Set(baseStats.value.map((stat) => stat.hero._id)));
const addFormHeroes = computed(() => heroes.value.filter((hero) => !assignedHeroIds.value.has(hero._id)));
const editFormHeroes = computed(() => {
  const currentHeroId = editBaseStatForm.value.heroId;
  return heroes.value.filter((hero) => !assignedHeroIds.value.has(hero._id) || hero._id === currentHeroId);
});

// ==================== Form Actions ====================
const resetForm = () => {
  baseStatForm.value = createDefaultBaseStatForm();
};

const resetEditForm = () => {
  editBaseStatForm.value = createDefaultBaseStatForm();
};

const openEditModal = (stat: BaseStat) => {
  editBaseStatForm.value = {
    _id: stat._id,
    heroId: stat.hero._id,
    hp: stat.hp,
    mana: stat.mana,
    energy: stat.energy,
    hp_regen: stat.hp_regen,
    mana_regen: stat.mana_regen,
    energy_regen: stat.energy_regen,
    physical_attack: stat.physical_attack,
    physical_defense: stat.physical_defense,
    magic_power: stat.magic_power,
    magic_defense: stat.magic_defense,
    attack_speed: stat.attack_speed,
    movement_speed: stat.movement_speed,
    spell_vamp_ratio: stat.spell_vamp_ratio,
    attack_range: stat.attack_range,
    crit_rate: stat.crit_rate ?? 0,
    crit_damage: stat.crit_damage ?? 0,
    physical_pen: stat.physical_pen ?? 0,
    magical_pen: stat.magical_pen ?? 0,
    lifesteal: stat.lifesteal ?? 0,
    resilience: stat.resilience ?? 0,
    crit_damage_reduction: stat.crit_damage_reduction ?? 0,
    received_heal: stat.received_heal ?? 0,
    hp_growth: stat.hp_growth ?? 0,
    mana_growth: stat.mana_growth ?? 0,
    energy_growth: stat.energy_growth ?? 0,
    hp_regen_growth: stat.hp_regen_growth ?? 0,
    mana_regen_growth: stat.mana_regen_growth ?? 0,
    energy_regen_growth: stat.energy_regen_growth ?? 0,
    physical_attack_growth: stat.physical_attack_growth ?? 0,
    physical_defense_growth: stat.physical_defense_growth ?? 0,
    magic_power_growth: stat.magic_power_growth ?? 0,
    magic_defense_growth: stat.magic_defense_growth ?? 0,
    attack_speed_growth: stat.attack_speed_growth ?? 0,
  };
};

const openDetailModal = (stat: BaseStat) => {
  selectedBaseStat.value = stat;
};

// ==================== Submit Handlers ====================
const onAddBaseStat = async () => {
  isSubmitting.value = true;
  try {
    await handleAddBaseStat(baseStatForm.value);
    resetForm();
  } catch (error) {
    console.error('Error adding base stat:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditBaseStat = async () => {
  isEditSubmitting.value = true;
  try {
    await handleEditBaseStat(editBaseStatForm.value);
    resetEditForm();
  } catch (error) {
    console.error('Error editing base stat:', error);
  } finally {
    isEditSubmitting.value = false;
  }
};

const handleExport = () => {
  if (baseStats.value.length === 0) {
    alertError('Tidak ada data base stat untuk diekspor.');
    return;
  }
  const source = filteredBaseStats.value.length ? filteredBaseStats.value : baseStats.value;
  exportBaseStats(source);
};

const handleDownloadTemplate = downloadBaseStatTemplate;

// ==================== Import from Excel ====================
const isImporting = ref(false);
const baseStatToken = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
const { createBaseStat } = useCreateBaseStat(baseStatToken);
const { updateBaseStat } = useUpdateBaseStat(baseStatToken);

const handleImport = async (file: File) => {
  isImporting.value = true;
  try {
    const inputs = await parseBaseStatFile(file);

    let createCount = 0;
    let updateCount = 0;
    const failures: string[] = [];

    for (const input of inputs) {
      const heroName = input.heroName;
      const hero = heroes.value.find((h) => h.name.toLowerCase() === heroName.toLowerCase());
      if (!hero) {
        failures.push(`${heroName}: hero tidak ditemukan`);
        continue;
      }
      try {
        const existing = baseStats.value.find((stat) => stat.hero._id === hero._id || stat.hero.name.toLowerCase() === heroName.toLowerCase());
        const { heroName: _heroName, ...baseStatInput } = input;
        if (existing) {
          await updateBaseStat({ id: existing._id, updateBaseStatInput: { ...baseStatInput, heroId: hero._id } });
          updateCount++;
        } else {
          await createBaseStat({ createBaseStatInput: { ...baseStatInput, heroId: hero._id } });
          createCount++;
        }
      } catch (err) {
        failures.push(`${heroName}: ${err instanceof Error ? err.message : 'gagal'}`);
      }
    }

    await safeRefetch();

    const successCount = createCount + updateCount;
    if (failures.length === 0) {
      alertSuccess(`Berhasil mengimpor ${successCount} data base stat (${createCount} baru, ${updateCount} update).`);
    } else if (successCount === 0) {
      alertError(`Gagal mengimpor semua data. ${failures.slice(0, 3).join(' | ')}`);
    } else {
      alertSuccess(`Impor selesai: ${successCount} berhasil (${createCount} baru, ${updateCount} update), ${failures.length} gagal. ${failures.slice(0, 3).join(' | ')}`);
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
      title="Data Base Stat"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Hero' },
        { name: 'Base Stat' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Base Stat</h4>
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
                    placeholder="Cari berdasarkan ID, nama hero, HP, Phy. Attack, atau Mag. Power..."
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
                <div class="row g-2 stat-action-row">
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-success w-100 stat-action-btn"
                      @click="handleExport"
                    >
                      <i class="ti ti-file-export me-1"></i>
                      Export Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-primary w-100 stat-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#import-base-stat"
                    >
                      <i class="ti ti-file-import me-1"></i>
                      Import Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-outline-secondary w-100 stat-action-btn position-relative"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#base-stat-filter-offcanvas"
                      aria-controls="base-stat-filter-offcanvas"
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
                      class="btn btn-info w-100 stat-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#add-base-stat"
                    >
                      <i class="ti ti-plus me-1"></i>
                      Tambah Base Stat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery || activeFilterCount > 0" class="alert alert-info py-2 mb-3 d-flex align-items-center flex-wrap gap-2">
              <i class="ti ti-filter"></i>
              <span>Menampilkan <strong>{{ filteredBaseStats.length }}</strong> dari <strong>{{ baseStats.length }}</strong> base stat</span>
              <span v-if="searchQuery" class="badge bg-primary-subtle text-primary">
                Pencarian: {{ searchQuery }}
              </span>
              <span v-if="selectedFilterRole" class="badge bg-warning-subtle text-warning">
                Role: {{ selectedFilterRole }}
              </span>
              <span v-if="selectedSortBy" class="badge bg-info-subtle text-info">
                Urut: {{ sortLabel }}
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
              id="base-stat-filter-offcanvas"
              aria-labelledby="base-stat-filter-offcanvas-label"
            >
              <div class="offcanvas-header border-bottom bg-light">
                <h5 class="offcanvas-title d-flex align-items-center" id="base-stat-filter-offcanvas-label">
                  <i class="ti ti-adjustments-horizontal me-2 text-primary"></i>
                  Filter Base Stat
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
                    Role Hero
                  </label>
                  <AppSelect v-model="selectedFilterRole" :options="roleFilterSelectOptions" placeholder="Semua Role" @change="currentPage = 1" />
                  <small class="text-muted">Saring base stat berdasarkan role hero pemilik.</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-arrows-sort me-1 text-info"></i>
                    Urutkan Berdasarkan
                  </label>
                  <AppSelect v-model="selectedSortBy" :options="sortBySelectOptions" placeholder="Tidak ada (urutan default)" class="mb-2" @change="currentPage = 1" />
                  <div class="btn-group w-100" role="group" aria-label="Arah pengurutan">
                    <input
                      type="radio"
                      class="btn-check"
                      id="sort-desc"
                      value="desc"
                      v-model="selectedSortDir"
                      :disabled="!selectedSortBy"
                    >
                    <label class="btn btn-outline-primary" for="sort-desc">
                      <i class="ti ti-sort-descending me-1"></i> Terbesar
                    </label>
                    <input
                      type="radio"
                      class="btn-check"
                      id="sort-asc"
                      value="asc"
                      v-model="selectedSortDir"
                      :disabled="!selectedSortBy"
                    >
                    <label class="btn btn-outline-primary" for="sort-asc">
                      <i class="ti ti-sort-ascending me-1"></i> Terkecil
                    </label>
                  </div>
                  <small class="text-muted d-block mt-1">Pilih atribut numerik untuk mengurutkan tabel.</small>
                </div>

                <div class="alert alert-light border d-flex align-items-center small mb-0">
                  <i class="ti ti-info-circle me-2 text-primary"></i>
                  Filter dan urutan akan diterapkan secara otomatis.
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

            <!-- Add Modal -->
            <BaseStatFormModal
              modalId="add-base-stat"
              title="Tambah Base Stat"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :baseStatForm="baseStatForm"
              :heroes="addFormHeroes"
              @update:baseStatForm="baseStatForm = $event"
              @submit="onAddBaseStat"
              @cancel="resetForm"
            />

            <!-- Edit Modal -->
            <BaseStatFormModal
              modalId="edit-base-stat"
              title="Edit Base Stat"
              headerColor="warning"
              :isSubmitting="isEditSubmitting"
              :baseStatForm="editBaseStatForm"
              :heroes="editFormHeroes"
              @update:baseStatForm="editBaseStatForm = $event"
              @submit="onEditBaseStat"
              @cancel="resetEditForm"
            />

            <!-- Detail Modal -->
            <BaseStatDetailModal
              modalId="detail-base-stat"
              :baseStat="selectedBaseStat"
            />

            <!-- Import Base Stat Modal -->
            <ImportModal
              modalId="import-base-stat"
              title="Import Data Base Stat"
              templateFileName="template-data-base-stat.xlsx"
              templateHint="Template berisi 1 baris contoh dan sheet petunjuk pengisian. Setiap hero hanya boleh memiliki 1 base stat."
              uploadHint="Pastikan kolom Nama Hero sama persis dengan nama hero pada Data Hero."
              :isImporting="isImporting"
              :onDownloadTemplate="handleDownloadTemplate"
              :onUpload="handleImport"
            />

            <!-- Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Hero</th>
                    <th>HP</th>
                    <th>Mana</th>
                    <th>Phy. Atk</th>
                    <th>Mag. Pow</th>
                    <th>Phy. Def</th>
                    <th>Mag. Def</th>
                    <th>Mov. Spd</th>
                    <th style="width: 200px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loading State -->
                  <tr v-if="baseStatLoading">
                    <td colspan="10" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data base stat...
                      </div>
                    </td>
                  </tr>

                  <!-- Data Rows -->
                  <tr
                    v-for="(stat, index) in paginatedBaseStats"
                    :key="stat._id"
                    class="text-center align-middle"
                    v-show="!baseStatLoading"
                  >
                    <td>{{ getRowNumber(Number(index)) }}</td>
                    <td>
                      <div class="d-flex align-items-center justify-content-center gap-2">
                        <img
                          v-if="stat.hero.image"
                          :src="stat.hero.image"
                          :alt="stat.hero.name"
                          class="rounded"
                          style="width: 36px; height: 36px; object-fit: cover;"
                        />
                        <div class="text-start">
                          <div class="fw-semibold">{{ stat.hero.name }}</div>
                          <small class="text-muted">{{ stat.hero.role.join(', ') }}</small>
                        </div>
                      </div>
                    </td>
                    <td>{{ stat.hp }}</td>
                    <td>{{ stat.mana }}</td>
                    <td>{{ stat.physical_attack }}</td>
                    <td>{{ stat.magic_power }}</td>
                    <td>{{ stat.physical_defense }}</td>
                    <td>{{ stat.magic_defense }}</td>
                    <td>{{ stat.movement_speed }}</td>
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <ModalButton
                          variant="secondary"
                          font="medium"
                          size="sm"
                          dataBsTarget="detail-base-stat"
                          @click="openDetailModal(stat)"
                        >
                          <i class="ti ti-eye"></i>
                        </ModalButton>

                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          dataBsTarget="edit-base-stat"
                          @click="openEditModal(stat)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <Button
                          variant="danger"
                          font="medium"
                          size="sm"
                          type="button"
                          @click="handleDeleteBaseStat(stat._id)"
                          class="px-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!baseStatLoading && paginatedBaseStats.length === 0 && baseStats.length > 0">
                    <td colspan="10" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada base stat yang sesuai dengan pencarian
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!baseStatLoading && baseStats.length === 0">
                    <td colspan="10" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data base stat
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="!baseStatLoading && filteredBaseStats.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredBaseStats.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.stat-action-row {
  height: 100%;
}

.stat-action-btn {
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

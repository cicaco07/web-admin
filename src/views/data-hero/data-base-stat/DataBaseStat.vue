<script setup lang="ts">
import { computed, ref } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Base Stat Components
import BaseStatFormModal from './components/BaseStatFormModal.vue';
import BaseStatDetailModal from './components/BaseStatDetailModal.vue';

// API & Services
import { useBaseStats } from '../../../lib/api/BaseStatApi';
import { useBaseStatService } from '../../../lib/service/BaseStatService';
import { useHeroes } from '../../../lib/api/HeroApi';

// Types
import type { BaseStat, BaseStatFormData } from '../../../types/BaseStat';
import { createDefaultBaseStatForm } from '../../../types/BaseStat';
import type { Hero } from '../../../types/Hero';

// ==================== Data Fetching ====================
const { result: baseStatResult, loading: baseStatLoading, refetch } = useBaseStats();
const { result: heroResult } = useHeroes();
const baseStats = computed<BaseStat[]>(() => baseStatResult.value?.baseStats || []);
const heroes = computed<Hero[]>(() => heroResult.value?.heroes || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddBaseStat, handleEditBaseStat, handleDeleteBaseStat } = useBaseStatService(safeRefetch);

// ==================== Search ====================
const searchQuery = ref('');

const filteredBaseStats = computed<BaseStat[]>(() => {
  if (!searchQuery.value.trim()) return baseStats.value;
  const query = searchQuery.value.toLowerCase().trim();
  return baseStats.value.filter((stat: BaseStat) =>
    stat._id.toLowerCase().includes(query) ||
    stat.hero.name.toLowerCase().includes(query) ||
    String(stat.hp).includes(query) ||
    String(stat.physical_attack).includes(query) ||
    String(stat.magic_power).includes(query)
  );
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
    attack_speed_ratio: stat.attack_speed_ratio,
    spell_vamp_ratio: stat.spell_vamp_ratio,
    attack_range: stat.attack_range,
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
            <!-- Search Section -->
            <div class="row mb-3">
              <div class="col-md-10">
                <div class="input-group">
                  <span class="input-group-text bg-primary text-white">
                    <i class="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Cari berdasarkan ID, nama hero, HP, Physical Attack, atau Magic Power..."
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
                <button
                  class="btn btn-outline-secondary w-100"
                  @click="searchQuery = ''; currentPage = 1"
                >
                  <i class="ti ti-refresh me-1"></i>
                  Reset
                </button>
              </div>
            </div>

            <!-- Add Button -->
            <div class="row mb-3">
              <div class="col-md-12 d-flex justify-content-end">
                <ModalButton
                  variant="info"
                  font="medium"
                  size="lg"
                  dataBsTarget="add-base-stat"
                >
                  <i class="ti ti-plus me-1"></i>
                  Tambah Base Stat
                </ModalButton>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery" class="alert alert-info py-2 mb-3">
              <div class="d-flex align-items-center">
                <i class="ti ti-filter me-2"></i>
                <span>Menampilkan {{ filteredBaseStats.length }} dari {{ baseStats.length }} base stat</span>
                <span class="ms-2">| Pencarian: <strong>{{ searchQuery }}</strong></span>
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

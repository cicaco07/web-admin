<script setup lang="ts">
import { computed, ref } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// BattleSpell Components
import BattleSpellFormModal from './components/BattleSpellFormModal.vue';
import BattleSpellDetailModal from './components/BattleSpellDetailModal.vue';

// API & Services
import { useBattleSpell } from '../../../lib/api/BattleSpellApi';
import { useBattleSpellService } from '../../../lib/service/BattleSpellService';

// Types
import type { BattleSpell, BattleSpellFormData } from '../../../types/BattleSpell';
import { createDefaultBattleSpellForm } from '../../../types/BattleSpell';

// ==================== Data Fetching ====================
const { result: battleSpellResult, loading: battleSpellLoading, refetch } = useBattleSpell();
const battleSpells = computed(() => battleSpellResult.value?.battleSpells || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddBattleSpell, handleEditBattleSpell, handleDeleteBattleSpell } = useBattleSpellService(safeRefetch);

// ==================== Search & Filter ====================
const searchQuery = ref('');

const filteredBattleSpells = computed(() => {
  let filtered = battleSpells.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((spell: BattleSpell) => 
      spell.name.toLowerCase().includes(query) ||
      spell.tag.toLowerCase().includes(query) ||
      spell.description.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedBattleSpells = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBattleSpells.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const battleSpellForm = ref<BattleSpellFormData>(createDefaultBattleSpellForm());
const editBattleSpellForm = ref<BattleSpellFormData>(createDefaultBattleSpellForm());
const originalIcon = ref<string>('');
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);

// ==================== Detail Modal State ====================
const selectedBattleSpell = ref<BattleSpell | null>(null);

// ==================== Form Actions ====================
const resetForm = () => {
  battleSpellForm.value = createDefaultBattleSpellForm();
};

const resetEditForm = () => {
  editBattleSpellForm.value = createDefaultBattleSpellForm();
  originalIcon.value = '';
};

const openEditModal = (spell: BattleSpell) => {
  editBattleSpellForm.value = {
    _id: spell._id,
    name: spell.name,
    tag: spell.tag,
    icon: spell.icon,
    description: spell.description,
    cooldown: spell.cooldown
  };
  originalIcon.value = spell.icon;
};

const openDetailModal = (spell: BattleSpell) => {
  selectedBattleSpell.value = spell;
};

// ==================== Submit Handlers ====================
const onAddBattleSpell = async () => {
  isSubmitting.value = true;
  try {
    await handleAddBattleSpell(battleSpellForm.value);
    resetForm();
  } catch (error) {
    console.error('Error adding battle spell:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditBattleSpell = async () => {
  isEditSubmitting.value = true;
  try {
    await handleEditBattleSpell(editBattleSpellForm.value);
    resetEditForm();
  } catch (error) {
    console.error('Error editing battle spell:', error);
  } finally {
    isEditSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Battle Spell"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Persiapan' },
        { name: 'Battle Spell' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Battle Spell</h4>
          </div>

          <div class="card-body">
            <!-- Search & Filter Section -->
            <div class="row mb-3">
              <div class="col-md-10">
                <div class="input-group">
                  <span class="input-group-text bg-primary text-white">
                    <i class="ti ti-search"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Cari nama, tag, atau deskripsi..."
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
                  Reset Filter
                </button>
              </div>
            </div>

            <!-- Add Battle Spell Button -->
            <div class="row mb-3">
              <div class="col-md-12 d-flex justify-content-end">
                <ModalButton
                  variant="info"
                  font="medium"
                  size="lg"
                  dataBsTarget="add-battle-spell"
                >
                  <i class="ti ti-plus me-1"></i>
                  Tambah Battle Spell
                </ModalButton>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery" class="alert alert-info py-2 mb-3">
              <div class="d-flex align-items-center">
                <i class="ti ti-filter me-2"></i>
                <span>Menampilkan {{ filteredBattleSpells.length }} dari {{ battleSpells.length }} battle spell</span>
                <span class="ms-2">
                  | Pencarian: <strong>{{ searchQuery }}</strong>
                </span>
              </div>
            </div>

            <!-- Add Modal -->
            <BattleSpellFormModal
              modalId="add-battle-spell"
              title="Tambah Data Battle Spell"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :battleSpellForm="battleSpellForm"
              @update:battleSpellForm="battleSpellForm = $event"
              @submit="onAddBattleSpell"
              @cancel="resetForm"
            />

            <!-- Edit Modal -->
            <BattleSpellFormModal
              modalId="edit-battle-spell"
              title="Edit Data Battle Spell"
              headerColor="warning"
              :isSubmitting="isEditSubmitting"
              :battleSpellForm="editBattleSpellForm"
              :originalIcon="originalIcon"
              @update:battleSpellForm="editBattleSpellForm = $event"
              @submit="onEditBattleSpell"
              @cancel="resetEditForm"
            />

            <!-- Detail Modal -->
            <BattleSpellDetailModal
              modalId="detail-battle-spell"
              :battleSpell="selectedBattleSpell"
            />

            <!-- Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Nama</th>
                    <th>Tag</th>
                    <th style="width: 80px;">Icon</th>
                    <th>Deskripsi</th>
                    <th style="width: 100px;">Cooldown</th>
                    <th style="width: 220px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loading State -->
                  <tr v-if="battleSpellLoading">
                    <td colspan="7" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data battle spell...
                      </div>
                    </td>
                  </tr>

                  <!-- Battle Spell Data Rows -->
                  <tr 
                    v-for="(spell, index) in paginatedBattleSpells" 
                    :key="spell._id" 
                    class="text-center align-middle"
                    v-show="!battleSpellLoading"
                  >
                    <td>{{ getRowNumber(Number(index)) }}</td>
                    <td>{{ spell.name }}</td>
                    <td>{{ spell.tag }}</td>
                    <td>
                      <img 
                        :src="`${spell.icon}`" 
                        alt="Icon" 
                        class="rounded" 
                        style="width: 50px; height: 50px;" 
                      />
                    </td>
                    <td class="text-start">{{ spell.description }}</td>
                    <td>{{ spell.cooldown }}s</td>
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <!-- Detail Button -->
                        <ModalButton
                          variant="secondary"
                          font="medium"
                          size="sm"
                          dataBsTarget="detail-battle-spell"
                          @click="openDetailModal(spell)"
                        >
                          <i class="ti ti-eye"></i>
                        </ModalButton>

                        <!-- Edit Button -->
                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          dataBsTarget="edit-battle-spell"
                          @click="openEditModal(spell)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <!-- Delete Button -->
                        <Button
                          variant="danger"
                          font="medium"
                          size="sm"
                          type="button"
                          @click="handleDeleteBattleSpell(spell._id)"
                          class="px-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!battleSpellLoading && paginatedBattleSpells.length === 0 && battleSpells.length > 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada battle spell yang sesuai dengan filter
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!battleSpellLoading && battleSpells.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data battle spell
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="!battleSpellLoading && filteredBattleSpells.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredBattleSpells.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

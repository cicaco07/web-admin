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
const { result: battleSpellResult, refetch } = useBattleSpell();
const battleSpells = computed(() => battleSpellResult.value?.battleSpells || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddBattleSpell, handleEditBattleSpell, handleDeleteBattleSpell } = useBattleSpellService(safeRefetch);

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedBattleSpells = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return battleSpells.value.slice(start, end);
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
            <!-- Add Button -->
            <div class="d-flex justify-content-end mb-3">
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
                  <tr 
                    v-for="(spell, index) in paginatedBattleSpells" 
                    :key="spell._id" 
                    class="text-center align-middle"
                  >
                    <td>{{ getRowNumber(index) }}</td>
                    <td>{{ spell.name }}</td>
                    <td>{{ spell.tag }}</td>
                    <td>
                      <img 
                        :src="`http://localhost:3000${spell.icon}`" 
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

                  <!-- Empty State -->
                  <tr v-if="battleSpells.length === 0">
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
              v-if="battleSpells.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="battleSpells.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import Badge from '../../../components/Badge/Badge.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Hero Components
import HeroDetailModal from './components/HeroDetailModal.vue';
import HeroFormModal from './components/HeroFormModal.vue';

// API & Services
import { useHeroes } from '../../../lib/api/HeroApi';
import { useHeroService } from '../../../lib/service/HeroService';

// Types
import type { Hero, HeroFormData } from '../../../types/Hero';
import { createDefaultHeroForm } from '../../../types/Hero';

// ==================== Data Fetching ====================
const { result: heroResult, refetch } = useHeroes();
const heroes = computed<Hero[]>(() => heroResult.value?.heroes || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddHero, handleEditHero, handleDeleteHero } = useHeroService(safeRefetch);

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedHeroes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return heroes.value.slice(start, end);
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

// ==================== Helper Functions ====================
const toArray = (value: string | string[]): string[] => {
  return Array.isArray(value) ? value : value ? [value] : [];
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
            <!-- Add Button -->
            <div class="d-flex justify-content-end mb-3">
              <ModalButton 
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-hero"
              >
                <i class="ti ti-plus me-1"></i>
                Tambah Data Hero
              </ModalButton>
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
                  <tr
                    v-for="(hero, index) in paginatedHeroes"
                    :key="hero._id"
                    class="text-center align-middle"
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

                  <!-- Empty State -->
                  <tr v-if="heroes.length === 0">
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
              v-if="heroes.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="heroes.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
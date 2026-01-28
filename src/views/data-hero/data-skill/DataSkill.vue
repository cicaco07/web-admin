<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import Badge from '../../../components/Badge/Badge.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Modal Components
import SkillDetailModal from './components/SkillDetailModal.vue';

// API
import { useSkills, useDeleteSkill } from '../../../lib/api/SkillApi';
import { useSkillsDetail } from '../../../lib/api/SkillDetailApi';
import { useHeroes } from '../../../lib/api/HeroApi';
import { alertConfirm, alertSuccess, alertError } from '../../../lib/alert';

// Types
import type { Skill, SkillDetail } from '../../../types/Skill';

// ==================== Router ====================
const router = useRouter();

// ==================== Data Fetching ====================
const { result: heroResult, refetch } = useHeroes();
const { result: skillResult, loading: skillLoading } = useSkills();
const { result: skillDetailResult } = useSkillsDetail();
const { deleteSkill } = useDeleteSkill();

// ==================== Computed ====================
interface SkillWithHero extends Skill {
  heroName: string;
}

const skills = computed<SkillWithHero[]>(() => {
  if (!skillResult.value?.heroes) return [];
  return skillResult.value.heroes.flatMap((hero: any) =>
    (hero.skills || []).map((skill: any) => ({
      ...skill,
      heroName: hero.name
    }))
  );
});

const getSkillDetails = computed(() => {
  if (!skillDetailResult.value?.skills) return [];
  return skillDetailResult.value.skills.flatMap((skill: any) =>
    (skill.skills_detail || []).map((detail: SkillDetail) => ({
      skillName: skill.name,
      skillId: skill._id,
      ...detail
    }))
  );
});

// ==================== Search & Filter ====================
const searchQuery = ref('');

const filteredSkills = computed(() => {
  let filtered = skills.value;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(skill => 
      skill.heroName.toLowerCase().includes(query) ||
      skill.name.toLowerCase().includes(query) ||
      skill.type.toLowerCase().includes(query) ||
      (Array.isArray(skill.tag) ? skill.tag.join(' ') : skill.tag || '').toLowerCase().includes(query)
    );
  }

  return filtered;
});

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedSkills = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSkills.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Skill Detail Modal ====================
const selectedSkill = ref<SkillWithHero | null>(null);

const selectedSkillDetails = computed(() => {
  if (!selectedSkill.value) return [];
  return getSkillDetails.value.filter((d: any) => d.skillId === selectedSkill.value?._id);
});

const openDetailModal = (skill: SkillWithHero) => {
  selectedSkill.value = skill;
};

// ==================== Actions ====================
const goToCreate = () => {
  router.push('/data-hero/skill/create');
};

const goToEdit = (skillId: string) => {
  router.push(`/data-hero/skill/${skillId}/edit`);
};

const handleDelete = async (skillId: string, skillName: string) => {
  const confirmed = await alertConfirm(`Yakin ingin menghapus skill "${skillName}"? Data akan dihapus permanen!`);
  if (!confirmed) return;

  try {
    await deleteSkill({ id: skillId });
    await refetch();
    alertSuccess('Skill berhasil dihapus');
  } catch (error) {
    console.error('Error deleting skill:', error);
    alertError('Gagal menghapus skill');
  }
};

// ==================== Helper ====================
const toArray = (value: string | string[]): string[] => {
  return Array.isArray(value) ? value : value ? [value] : [];
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Skill"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Hero' },
        { name: 'Skill' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Skill Hero</h4>
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
                    placeholder="Cari nama hero, nama skill, tipe, atau tag..."
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

            <!-- Add Skill Button -->
            <div class="row mb-3">
              <div class="col-md-12 d-flex justify-content-end">
                <Button
                  variant="info"
                  @click="goToCreate"
                >
                  <i class="ti ti-plus me-1"></i>
                  Tambah Data Skill
                </Button>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery" class="alert alert-info py-2 mb-3">
              <div class="d-flex align-items-center">
                <i class="ti ti-filter me-2"></i>
                <span>Menampilkan {{ filteredSkills.length }} dari {{ skills.length }} skill</span>
                <span class="ms-2">
                  | Pencarian: <strong>{{ searchQuery }}</strong>
                </span>
              </div>
            </div>

            <!-- Skills Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover m-t-30">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Nama Hero</th>
                    <th style="width: 80px;">Ikon</th>
                    <th>Nama Skill</th>
                    <th>Tipe</th>
                    <th>Tag</th>
                    <th style="width: 200px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loading State -->
                  <tr v-if="skillLoading">
                    <td colspan="7" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <div class="mt-3 text-muted fw-semibold">
                        Memuat data skill...
                      </div>
                    </td>
                  </tr>

                  <!-- Skill Data Rows -->
                  <tr
                    v-for="(skill, index) in paginatedSkills"
                    :key="skill._id"
                    class="text-center align-middle"
                    v-show="!skillLoading"
                  >
                    <td>{{ getRowNumber(index) }}</td>
                    <td class="fw-semibold">{{ skill.heroName }}</td>
                    <td>
                      <img 
                        :src="skill.skill_icon" 
                        :alt="skill.name"
                        style="width: 50px; height: 50px; object-fit: contain;"
                      >
                    </td>
                    <td>{{ skill.name }}</td>
                    <td>{{ skill.type }}</td>
                    <td>
                      <Badge
                        v-for="(tag, i) in toArray(skill.tag)"
                        :key="i"
                        color="primary"
                        class="me-1"
                      >
                        {{ tag }}
                      </Badge>
                    </td>
                    <td>
                      <div class="d-flex flex-wrap gap-1 justify-content-center">
                        <!-- Detail Button -->
                        <ModalButton 
                          variant="secondary"
                          font="medium"
                          size="sm"
                          dataBsTarget="skill-detail-modal"
                          @click="openDetailModal(skill)"
                        >
                          <i class="ti ti-eye"></i>
                        </ModalButton>

                        <!-- Edit Button -->
                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          @click="goToEdit(skill._id)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <!-- Delete Button -->
                        <ModalButton
                          variant="danger"
                          font="medium"
                          size="sm"
                          @click="handleDelete(skill._id, skill.name)"
                        >
                          <i class="ti ti-trash"></i>
                        </ModalButton>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State - Filter Results -->
                  <tr v-if="!skillLoading && paginatedSkills.length === 0 && skills.length > 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="ti ti-filter-off fs-1 d-block mb-2"></i>
                      Tidak ada skill yang sesuai dengan filter
                    </td>
                  </tr>

                  <!-- Empty State - No Data -->
                  <tr v-if="!skillLoading && skills.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data skill
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="!skillLoading && filteredSkills.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="filteredSkills.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Detail Modal -->
    <SkillDetailModal
      modalId="skill-detail-modal"
      :skill="selectedSkill"
      :skillDetails="selectedSkillDetails"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Badge from '../../../components/Badge/Badge.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import ImportModal from '../../../components/Modal/ImportModal.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';
import AppSelect from '../../../components/AppSelect.vue';
import type { SelectOption } from '../../../components/AppSelect.vue';

// Modal Components
import SkillDetailModal from './components/SkillDetailModal.vue';

// API
import { useSkills, useDeleteSkill, useAddSkillToHero, useUpdateSkill } from '../../../lib/api/SkillApi';
import { useSkillsDetail, useAddSkillDetailToSkill } from '../../../lib/api/SkillDetailApi';
import { useHeroes } from '../../../lib/api/HeroApi';
import { alertConfirm, alertSuccess, alertError } from '../../../lib/alert';
import { downloadSkillTemplate, exportSkills, parseSkillFile } from '../../../lib/excel/skill.excel';
import type { HeroSkillsBundle, ParsedHeroSheet, SkillRow } from '../../../lib/excel/skill.excel';

// Types
import type { Skill, SkillDetail } from '../../../types/Skill';
import { SKILL_TAG_OPTIONS, SKILL_TYPE_OPTIONS } from '../../../types/Skill';
import type { Hero } from '../../../types/Hero';

// ==================== Router ====================
const router = useRouter();

// ==================== Data Fetching ====================
const { result: heroResult, refetch } = useHeroes();
const { result: skillResult, loading: skillLoading, refetch: refetchSkills } = useSkills();
const { result: skillDetailResult, refetch: refetchSkillDetails } = useSkillsDetail();
const { deleteSkill } = useDeleteSkill();
const { addSkillToHero } = useAddSkillToHero();
const { updateSkill } = useUpdateSkill();
const { addSkillDetailToSkill } = useAddSkillDetailToSkill();

const heroes = computed<Hero[]>(() => heroResult.value?.heroes || []);

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
const selectedFilterType = ref('');
const selectedFilterTag = ref('');
const selectedFilterHero = ref('');

const heroNameOptions = computed(() => {
  const names = new Set<string>();
  skills.value.forEach((s) => {
    if (s.heroName) names.add(s.heroName);
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b));
});

const heroFilterSelectOptions = computed<SelectOption[]>(() => [
  { id: '', text: 'Semua Hero' },
  ...heroNameOptions.value.map(name => ({ id: name, text: name })),
]);

const typeFilterSelectOptions = computed<SelectOption[]>(() => [
  { id: '', text: 'Semua Tipe' },
  ...SKILL_TYPE_OPTIONS.map(type => ({ id: type, text: type })),
]);

const tagFilterSelectOptions = computed<SelectOption[]>(() => [
  { id: '', text: 'Semua Tag' },
  ...SKILL_TAG_OPTIONS.map(tag => ({ id: tag, text: tag })),
]);

const filteredSkills = computed(() => {
  let filtered = skills.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(skill =>
      skill.heroName.toLowerCase().includes(query) ||
      skill.name.toLowerCase().includes(query) ||
      skill.type.toLowerCase().includes(query) ||
      (Array.isArray(skill.tag) ? skill.tag.join(' ') : skill.tag || '').toLowerCase().includes(query)
    );
  }

  if (selectedFilterType.value) {
    filtered = filtered.filter(skill => skill.type === selectedFilterType.value);
  }

  if (selectedFilterTag.value) {
    filtered = filtered.filter(skill => {
      const tags = Array.isArray(skill.tag) ? skill.tag : skill.tag ? [skill.tag] : [];
      return tags.includes(selectedFilterTag.value);
    });
  }

  if (selectedFilterHero.value) {
    filtered = filtered.filter(skill => skill.heroName === selectedFilterHero.value);
  }

  return filtered;
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedFilterType.value) count++;
  if (selectedFilterTag.value) count++;
  if (selectedFilterHero.value) count++;
  return count;
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedFilterType.value = '';
  selectedFilterTag.value = '';
  selectedFilterHero.value = '';
  currentPage.value = 1;
};

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

// ==================== Export to Excel (per-hero sheet) ====================
const groupSkillsByHero = (): HeroSkillsBundle[] => {
  if (!skillResult.value?.heroes) return [];
  return (skillResult.value.heroes as any[]).map((hero) => ({
    heroId: hero._id,
    heroName: hero.name,
    skills: (hero.skills || []) as SkillRow[],
  }));
};

const buildSkillDetailMap = (): Map<string, SkillDetail[]> => {
  const detailsBySkillId = new Map<string, SkillDetail[]>();
  if (!skillDetailResult.value?.skills) return detailsBySkillId;
  skillDetailResult.value.skills.forEach((skill: { _id: string; skills_detail?: SkillDetail[] }) => {
    detailsBySkillId.set(skill._id, skill.skills_detail || []);
  });
  return detailsBySkillId;
};

const toArray = (value: string | string[]): string[] => (Array.isArray(value) ? value : value ? [value] : []);

const handleExport = () => {
  const bundles = groupSkillsByHero().filter((b) => b.skills.length > 0);
  if (bundles.length === 0) {
    alertError('Tidak ada data skill untuk diekspor.');
    return;
  }
  exportSkills(bundles, buildSkillDetailMap());
};

const handleDownloadTemplate = downloadSkillTemplate;

// ==================== Import from Excel ====================
const isImporting = ref(false);

interface AddSkillResult {
  data?: {
    addSkillToHero?: {
      _id?: string;
    };
  };
}

const getCreatedSkillId = (result: unknown): string => {
  const addSkillResult = result as AddSkillResult;
  return addSkillResult.data?.addSkillToHero?._id ?? '';
};

const findExistingSkill = (heroId: string, skillName: string): SkillRow | undefined => {
  const bundle = groupSkillsByHero().find((item) => item.heroId === heroId);
  return bundle?.skills.find((skill) => skill.name.toLowerCase() === skillName.toLowerCase());
};

const getMissingDetails = (skillId: string, importedDetails: SkillDetail[]): SkillDetail[] => {
  const existingLevels = new Set((buildSkillDetailMap().get(skillId) ?? []).map((detail) => detail.level));
  return importedDetails.filter((detail) => !existingLevels.has(detail.level));
};

const isHeroBaseStatValidationError = (err: unknown): boolean =>
  err instanceof Error && err.message.includes('Hero validation failed: baseStat');

const handleImport = async (file: File) => {
  isImporting.value = true;
  try {
    const parsed: ParsedHeroSheet[] = await parseSkillFile(file);

    let createdSkills = 0;
    let updatedSkills = 0;
    let skippedSkillUpdates = 0;
    let totalDetails = 0;
    const failures: string[] = [];

    for (const sheet of parsed) {
      const hero = heroes.value.find(
        (h) => h.name.toLowerCase() === sheet.heroName.toLowerCase(),
      );
      if (!hero) {
        failures.push(`Hero "${sheet.heroName}" tidak ditemukan, sheet dilewati.`);
        continue;
      }

      for (const skill of sheet.skills) {
        try {
          const input = {
            name: skill.name,
            type: skill.type,
            tag: skill.tag,
            skill_icon: skill.skill_icon,
            lite_description: skill.lite_description,
            full_description: skill.full_description,
          };
          const existingSkill = findExistingSkill(hero._id, skill.name);
          let skillId = existingSkill?._id ?? '';

          if (existingSkill) {
            try {
              await updateSkill({ id: existingSkill._id, input });
              updatedSkills++;
            } catch (errUpdate) {
              if (!isHeroBaseStatValidationError(errUpdate)) throw errUpdate;
              skippedSkillUpdates++;
            }
          } else {
            const res = await addSkillToHero({ heroId: hero._id, input });
            skillId = getCreatedSkillId(res);
            createdSkills++;
          }

          const detailsToCreate = existingSkill ? getMissingDetails(skillId, skill.details) : skill.details;
          if (skillId && detailsToCreate.length > 0) {
            try {
              await addSkillDetailToSkill({
                skillId,
                input: detailsToCreate,
              });
              totalDetails += detailsToCreate.length;
            } catch (errDetail) {
              failures.push(
                `Detail ${sheet.heroName}/${skill.name}: ${errDetail instanceof Error ? errDetail.message : 'gagal'}`,
              );
            }
          }
        } catch (err) {
          failures.push(
            `Skill ${sheet.heroName}/${skill.name}: ${err instanceof Error ? err.message : 'gagal'}`,
          );
        }
      }
    }

    await Promise.all([refetch(), refetchSkills(), refetchSkillDetails()]);

    const totalSkills = createdSkills + updatedSkills;
    if (failures.length === 0) {
      alertSuccess(`Impor berhasil: ${totalSkills} skill (${createdSkills} baru, ${updatedSkills} update, ${skippedSkillUpdates} update skill dilewati karena baseStat hero invalid), ${totalDetails} detail baru.`);
    } else {
      alertSuccess(
        `Impor selesai dengan catatan: ${totalSkills} skill berhasil (${createdSkills} baru, ${updatedSkills} update, ${skippedSkillUpdates} update skill dilewati karena baseStat hero invalid), ${totalDetails} detail baru, ${failures.length} masalah. ${failures.slice(0, 3).join(' | ')}`,
      );
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
              <div class="col-12 col-lg-7">
                <div class="row g-2 skill-action-row">
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-success w-100 skill-action-btn"
                      @click="handleExport"
                    >
                      <i class="ti ti-file-export me-1"></i>
                      Export Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-primary w-100 skill-action-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#import-skill"
                    >
                      <i class="ti ti-file-import me-1"></i>
                      Import Excel
                    </button>
                  </div>
                  <div class="col-6 col-md-3">
                    <button
                      type="button"
                      class="btn btn-outline-secondary w-100 skill-action-btn position-relative"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#skill-filter-offcanvas"
                      aria-controls="skill-filter-offcanvas"
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
                      class="btn btn-info w-100 skill-action-btn"
                      @click="goToCreate"
                    >
                      <i class="ti ti-plus me-1"></i>
                      Tambah Skill
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filter Info -->
            <div v-if="searchQuery || activeFilterCount > 0" class="alert alert-info py-2 mb-3 d-flex align-items-center flex-wrap gap-2">
              <i class="ti ti-filter"></i>
              <span>Menampilkan <strong>{{ filteredSkills.length }}</strong> dari <strong>{{ skills.length }}</strong> skill</span>
              <span v-if="searchQuery" class="badge bg-primary-subtle text-primary">
                Pencarian: {{ searchQuery }}
              </span>
              <span v-if="selectedFilterHero" class="badge bg-secondary-subtle text-secondary">
                Hero: {{ selectedFilterHero }}
              </span>
              <span v-if="selectedFilterType" class="badge bg-warning-subtle text-warning">
                Tipe: {{ selectedFilterType }}
              </span>
              <span v-if="selectedFilterTag" class="badge bg-info-subtle text-info">
                Tag: {{ selectedFilterTag }}
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
              id="skill-filter-offcanvas"
              aria-labelledby="skill-filter-offcanvas-label"
            >
              <div class="offcanvas-header border-bottom bg-light">
                <h5 class="offcanvas-title d-flex align-items-center" id="skill-filter-offcanvas-label">
                  <i class="ti ti-adjustments-horizontal me-2 text-primary"></i>
                  Filter Skill
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
                    <i class="ti ti-user me-1 text-secondary"></i>
                    Hero
                  </label>
                  <AppSelect v-model="selectedFilterHero" :options="heroFilterSelectOptions" placeholder="Semua Hero" @change="currentPage = 1" />
                  <small class="text-muted">Saring berdasarkan hero pemilik skill.</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-bolt me-1 text-warning"></i>
                    Tipe Skill
                  </label>
                  <AppSelect v-model="selectedFilterType" :options="typeFilterSelectOptions" placeholder="Semua Tipe" @change="currentPage = 1" />
                  <small class="text-muted">Pilih jenis skill (Passive/Skill 1/Skill 2/Ultimate).</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-tag me-1 text-info"></i>
                    Tag
                  </label>
                  <AppSelect v-model="selectedFilterTag" :options="tagFilterSelectOptions" placeholder="Semua Tag" @change="currentPage = 1" />
                  <small class="text-muted">Tampilkan skill yang mengandung tag tertentu.</small>
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

    <!-- Import Skill Modal -->
    <ImportModal
      modalId="import-skill"
      title="Import Data Skill"
      templateFileName="template-data-skill.xlsx"
      templateHint="Template berisi 1 sheet contoh per hero (Skill Info + Skill Detail) dan sheet petunjuk."
      uploadHint="Setiap sheet pada file akan dianggap sebagai data milik hero dengan nama yang sama. Sheet 'Petunjuk' diabaikan."
      :isImporting="isImporting"
      :onDownloadTemplate="handleDownloadTemplate"
      :onUpload="handleImport"
    />
  </DashboardLayout>
</template>

<style scoped>
.skill-action-row {
  height: 100%;
}

.skill-action-btn {
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

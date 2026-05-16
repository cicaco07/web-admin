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

// Modal Components
import SkillDetailModal from './components/SkillDetailModal.vue';

// API
import { useSkills, useDeleteSkill, useAddSkillToHero } from '../../../lib/api/SkillApi';
import { useSkillsDetail, useAddSkillDetailToSkill } from '../../../lib/api/SkillDetailApi';
import { useHeroes } from '../../../lib/api/HeroApi';
import { alertConfirm, alertSuccess, alertError } from '../../../lib/alert';

// Types
import type { Skill, SkillDetail } from '../../../types/Skill';
import { SKILL_TAG_OPTIONS, SKILL_TYPE_OPTIONS } from '../../../types/Skill';
import type { Hero } from '../../../types/Hero';

// Excel utils
import {
  exportSheetsToExcel,
  readExcelAsAoa,
  toStr,
  toNum,
  toList,
} from '../../../utils/excel';
import type { SheetDefinition, SheetSection } from '../../../utils/excel';

// ==================== Router ====================
const router = useRouter();

// ==================== Data Fetching ====================
const { result: heroResult, refetch } = useHeroes();
const { result: skillResult, loading: skillLoading, refetch: refetchSkills } = useSkills();
const { result: skillDetailResult, refetch: refetchSkillDetails } = useSkillsDetail();
const { deleteSkill } = useDeleteSkill();
const { addSkillToHero } = useAddSkillToHero();
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

// ==================== Helper ====================
const toArray = (value: string | string[]): string[] => {
  return Array.isArray(value) ? value : value ? [value] : [];
};

// ==================== Export to Excel (per-hero sheet) ====================
interface SkillRow {
  _id: string;
  name: string;
  type: string;
  tag: string[];
  skill_icon: string;
  lite_description: string;
  full_description: string;
}

interface HeroSkillsBundle {
  heroId: string;
  heroName: string;
  skills: SkillRow[];
}

const SKILL_INFO_HEADERS = [
  'Nama Skill',
  'Tipe',
  'Tag',
  'Skill Icon URL',
  'Deskripsi Singkat',
  'Deskripsi Lengkap',
];
const SKILL_INFO_WIDTHS = [22, 14, 28, 35, 50, 60];

const SKILL_DETAIL_HEADERS = ['Nama Skill', 'Level', 'Atribut', 'Nilai'];
const SKILL_DETAIL_WIDTHS = [22, 8, 26, 14];

const groupSkillsByHero = (): HeroSkillsBundle[] => {
  if (!skillResult.value?.heroes) return [];
  return (skillResult.value.heroes as any[]).map((hero) => ({
    heroId: hero._id,
    heroName: hero.name,
    skills: (hero.skills || []) as SkillRow[],
  }));
};

const findSkillDetailsForSkillId = (skillId: string): SkillDetail[] => {
  if (!skillDetailResult.value?.skills) return [];
  const found = (skillDetailResult.value.skills as any[]).find((s) => s._id === skillId);
  return (found?.skills_detail || []) as SkillDetail[];
};

const buildHeroSheet = (bundle: HeroSkillsBundle): SheetDefinition => {
  const skillInfoRows = bundle.skills.map((s) => [
    s.name,
    s.type,
    toArray(s.tag).join(', '),
    s.skill_icon,
    s.lite_description,
    s.full_description,
  ]);

  const skillDetailRows: (string | number)[][] = [];
  bundle.skills.forEach((skill) => {
    const details = findSkillDetailsForSkillId(skill._id);
    details
      .slice()
      .sort((a, b) => (a.level || 0) - (b.level || 0))
      .forEach((detail) => {
        const attrs = (detail.attributes || {}) as Record<string, number>;
        const keys = Object.keys(attrs);
        if (keys.length === 0) {
          skillDetailRows.push([skill.name, detail.level, '', '']);
        } else {
          keys.forEach((key) => {
            skillDetailRows.push([skill.name, detail.level, key, attrs[key]]);
          });
        }
      });
  });

  const sections: SheetSection[] = [
    {
      title: `Hero: ${bundle.heroName}`,
      aoa: [['Hero Name', bundle.heroName]],
      columnWidths: [22, 30],
    },
    {
      title: 'Skill Info',
      aoa: [SKILL_INFO_HEADERS, ...skillInfoRows],
      columnWidths: SKILL_INFO_WIDTHS,
    },
    {
      title: 'Skill Detail (long format: 1 baris = 1 atribut per level)',
      aoa: [SKILL_DETAIL_HEADERS, ...skillDetailRows],
      columnWidths: SKILL_DETAIL_WIDTHS,
    },
  ];

  return { name: bundle.heroName || 'Hero', aoa: [], sections };
};

const handleExport = () => {
  const bundles = groupSkillsByHero().filter((b) => b.skills.length > 0);
  if (bundles.length === 0) {
    alertError('Tidak ada data skill untuk diekspor.');
    return;
  }
  const sheets = bundles.map(buildHeroSheet);
  exportSheetsToExcel(sheets, `data-skill-${new Date().toISOString().slice(0, 10)}`);
};

const handleDownloadTemplate = () => {
  const exampleSkillRows: (string | number)[][] = [
    [
      'Fission Wave',
      'Skill 1',
      'Buff, Slow',
      'https://example.com/icon/fission-wave.png',
      'Menembakkan gelombang energi yang memantul.',
      'Memantul ke unit terdekat. Damage: {{Damage}}, Slow: {{Slow}}%.',
    ],
    [
      'Hidden Moonlight',
      'Skill 2',
      'Conceal',
      'https://example.com/icon/hidden-moonlight.png',
      'Menjadi tidak terlihat sementara.',
      'Bertahan {{Durasi}} detik dan menambah movement speed sebesar {{MS}}%.',
    ],
    [
      'Goddess\'s Arrow',
      'Ultimate',
      'Burst Damage',
      'https://example.com/icon/goddess-arrow.png',
      'Memanah dari kejauhan dengan damage besar.',
      'Damage: {{Damage}}, slow {{Slow}}% selama {{Durasi}} detik.',
    ],
  ];
  const exampleDetailRows: (string | number)[][] = [];
  exampleSkillRows.forEach((row) => {
    const skillName = row[0];
    [1, 2, 3, 4, 5].forEach((lvl) => {
      exampleDetailRows.push([skillName, lvl, 'Damage', 100 + lvl * 25]);
      exampleDetailRows.push([skillName, lvl, 'Cooldown', 12 - lvl]);
    });
  });

  const heroSheet: SheetDefinition = {
    name: 'Miya',
    aoa: [],
    sections: [
      {
        title: 'Hero: Miya',
        aoa: [['Hero Name', 'Miya']],
        columnWidths: [22, 30],
      },
      {
        title: 'Skill Info',
        aoa: [SKILL_INFO_HEADERS, ...exampleSkillRows],
        columnWidths: SKILL_INFO_WIDTHS,
      },
      {
        title: 'Skill Detail (long format: 1 baris = 1 atribut per level)',
        aoa: [SKILL_DETAIL_HEADERS, ...exampleDetailRows],
        columnWidths: SKILL_DETAIL_WIDTHS,
      },
    ],
  };

  const guideSheet: SheetDefinition = {
    name: 'Petunjuk',
    aoa: [
      ['Petunjuk Pengisian Template Data Skill'],
      [],
      ['1. Setiap hero menempati 1 sheet. Nama sheet = nama hero (harus sama persis dengan nama hero pada Data Hero).'],
      ['2. Sheet wajib memiliki 3 bagian dengan urutan: "Hero Name", "Skill Info", lalu "Skill Detail".'],
      ['3. Bagian "Skill Info": 1 baris per skill. Kolom Tag boleh diisi banyak nilai dipisahkan koma.'],
      [`4. Pilihan Tipe yang valid: ${SKILL_TYPE_OPTIONS.join(', ')}.`],
      [`5. Pilihan Tag yang valid: ${SKILL_TAG_OPTIONS.join(', ')}.`],
      ['6. Bagian "Skill Detail" memakai format panjang: setiap baris berisi 1 atribut untuk 1 level.'],
      ['7. Skill bertipe "Passive" boleh dilewati di bagian Skill Detail.'],
      ['8. Untuk menambah hero, salin sheet "Miya" lalu ganti nama sheet dan isi datanya.'],
      ['9. Field deskripsi mendukung placeholder berbentuk {{NamaAtribut}} yang akan diganti nilai sesuai level.'],
    ],
    columnWidths: [120],
  };

  exportSheetsToExcel([heroSheet, guideSheet], 'template-data-skill');
};

// ==================== Import from Excel ====================
const isImporting = ref(false);

interface ParsedSkill {
  name: string;
  type: string;
  tag: string[];
  skill_icon: string;
  lite_description: string;
  full_description: string;
  details: { level: number; attributes: Record<string, number> }[];
}

interface ParsedHeroSheet {
  heroName: string;
  skills: ParsedSkill[];
}

const findSectionStart = (rows: (string | number | null)[][], keyword: string): number => {
  return rows.findIndex((row) => {
    const first = toStr(row?.[0]).toLowerCase();
    return first.startsWith(keyword.toLowerCase());
  });
};

const isHeaderRow = (row: (string | number | null)[], expected: string[]): boolean => {
  for (let i = 0; i < expected.length; i++) {
    if (toStr(row?.[i]).toLowerCase() !== expected[i].toLowerCase()) return false;
  }
  return true;
};

const parseHeroSheet = (sheetName: string, rows: (string | number | null)[][]): ParsedHeroSheet | null => {
  const skillInfoStart = findSectionStart(rows, 'Skill Info');
  const skillDetailStart = findSectionStart(rows, 'Skill Detail');
  if (skillInfoStart < 0) return null;

  const infoEnd = skillDetailStart > 0 ? skillDetailStart : rows.length;
  const skillInfoRows = rows.slice(skillInfoStart + 1, infoEnd);
  const headerIdx = skillInfoRows.findIndex((row) => isHeaderRow(row, SKILL_INFO_HEADERS));
  if (headerIdx < 0) return null;
  const dataRows = skillInfoRows.slice(headerIdx + 1).filter((row) => toStr(row?.[0]).length > 0);

  const skillsMap = new Map<string, ParsedSkill>();
  dataRows.forEach((row) => {
    const name = toStr(row[0]);
    if (!name) return;
    skillsMap.set(name, {
      name,
      type: toStr(row[1]),
      tag: toList(row[2]),
      skill_icon: toStr(row[3]),
      lite_description: toStr(row[4]),
      full_description: toStr(row[5]),
      details: [],
    });
  });

  if (skillDetailStart >= 0) {
    const detailRows = rows.slice(skillDetailStart + 1);
    const detailHeaderIdx = detailRows.findIndex((row) => isHeaderRow(row, SKILL_DETAIL_HEADERS));
    if (detailHeaderIdx >= 0) {
      const detailDataRows = detailRows
        .slice(detailHeaderIdx + 1)
        .filter((row) => toStr(row?.[0]).length > 0 && toStr(row?.[1]).length > 0);
      const grouped = new Map<string, Map<number, Record<string, number>>>();
      detailDataRows.forEach((row) => {
        const skillName = toStr(row[0]);
        const level = toNum(row[1]);
        const attr = toStr(row[2]);
        const value = toNum(row[3]);
        if (!skillName || !level) return;
        if (!grouped.has(skillName)) grouped.set(skillName, new Map());
        const levelMap = grouped.get(skillName)!;
        if (!levelMap.has(level)) levelMap.set(level, {});
        if (attr) levelMap.get(level)![attr] = value;
      });

      grouped.forEach((levelMap, skillName) => {
        const skill = skillsMap.get(skillName);
        if (!skill) return;
        skill.details = Array.from(levelMap.entries())
          .map(([level, attributes]) => ({ level, attributes }))
          .sort((a, b) => a.level - b.level);
      });
    }
  }

  return {
    heroName: sheetName,
    skills: Array.from(skillsMap.values()),
  };
};

const handleImport = async (file: File) => {
  isImporting.value = true;
  try {
    const sheetMap = await readExcelAsAoa(file);
    const sheetEntries = Object.entries(sheetMap).filter(
      ([name]) => !['Petunjuk', 'Instructions', 'Guide'].includes(name),
    );

    const parsed: ParsedHeroSheet[] = [];
    sheetEntries.forEach(([sheetName, rows]) => {
      const result = parseHeroSheet(sheetName, rows);
      if (result && result.skills.length > 0) parsed.push(result);
    });

    if (parsed.length === 0) {
      throw new Error('Tidak ada data skill yang valid pada file. Pastikan struktur sheet sesuai template.');
    }

    let totalSkills = 0;
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
          const res = await addSkillToHero({
            heroId: hero._id,
            input: {
              name: skill.name,
              type: skill.type,
              tag: skill.tag,
              skill_icon: skill.skill_icon,
              lite_description: skill.lite_description,
              full_description: skill.full_description,
            },
          });
          const newSkillId = (res as any)?.data?.addSkillToHero?._id;
          totalSkills++;

          if (newSkillId && skill.details.length > 0) {
            try {
              await addSkillDetailToSkill({
                skillId: newSkillId,
                input: skill.details,
              });
              totalDetails += skill.details.length;
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

    if (failures.length === 0) {
      alertSuccess(`Impor berhasil: ${totalSkills} skill, ${totalDetails} baris detail.`);
    } else {
      alertSuccess(
        `Impor selesai dengan catatan: ${totalSkills} skill berhasil, ${failures.length} masalah. ${failures.slice(0, 3).join(' | ')}`,
      );
    }
    (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('import-skill'))?.hide();
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
                  <select
                    class="form-select"
                    v-model="selectedFilterHero"
                    @change="currentPage = 1"
                  >
                    <option value="">Semua Hero</option>
                    <option
                      v-for="name in heroNameOptions"
                      :key="name"
                      :value="name"
                    >
                      {{ name }}
                    </option>
                  </select>
                  <small class="text-muted">Saring berdasarkan hero pemilik skill.</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-bolt me-1 text-warning"></i>
                    Tipe Skill
                  </label>
                  <select
                    class="form-select"
                    v-model="selectedFilterType"
                    @change="currentPage = 1"
                  >
                    <option value="">Semua Tipe</option>
                    <option
                      v-for="type in SKILL_TYPE_OPTIONS"
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>
                  </select>
                  <small class="text-muted">Pilih jenis skill (Passive/Skill 1/Skill 2/Ultimate).</small>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-semibold">
                    <i class="ti ti-tag me-1 text-info"></i>
                    Tag
                  </label>
                  <select
                    class="form-select"
                    v-model="selectedFilterTag"
                    @change="currentPage = 1"
                  >
                    <option value="">Semua Tag</option>
                    <option
                      v-for="tag in SKILL_TAG_OPTIONS"
                      :key="tag"
                      :value="tag"
                    >
                      {{ tag }}
                    </option>
                  </select>
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

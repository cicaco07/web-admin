<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import { useAddSkillToHero, useDeleteSkill, useSkills, useUpdateSkill } from '../../lib/api/SkillApi.ts';
import { useHeroes, } from '../../lib/api/HeroApi.ts';
import { useAddSkillDetailToSkill, useSkillsDetail } from '../../lib/api/SkillDetailApi.ts';
import { alertConfirm, alertError, alertSuccess } from '../../lib/alert.ts';

const { result: heroResult, refetch } = useHeroes();
const heroes = computed(() => heroResult.value?.heroes || []);

const { addSkillToHero } = useAddSkillToHero();
const { updateSkill } = useUpdateSkill();
const { deleteSkill } = useDeleteSkill();
const { addSkillDetailToSkill } = useAddSkillDetailToSkill();

const isSubmitting = ref(false);

const skillForm = ref({
  heroId: '',
  name: '',
  type: '',
  tag: [],
  // attack_effect: '',
  skill_icon: '',
  lite_description: '',
  full_description: '',
});

const currentStep = ref(1);

// const formData = ref({
//   name: '',
//   type: '',
//   description: '',
//   skillIcon: '',
//   tags: '',
// });

function validateStep(step: number) {
  if (step === 1) {
    // return skillForm.value.name.trim() !== '' && skillForm.value.type.trim() !== '';
  } else if (step === 2) {
    // return skillForm.value.lite_description.trim() !== '';
  // } else if (step === 3) {
  //   return skillForm.value.skillIcon.trim() !== '' && skillForm.value.tag.trim() !== '';
  // }
  }
  return true;
}

const errors = ref<{ [key: string]: string }>({});

function nextStep() {
  errors.value = {};
  // if (currentStep.value === 1) {
  //   if (!skillForm.value.name.trim()) {
  //     errors.value.name = 'Kolom nama tidak boleh kosong';
  //   }
  //   if (!skillForm.value.type.trim()) {
  //     errors.value.type = 'Kolom tipe tidak boleh kosong';
  //   }
  //   if (!skillForm.value.heroId) {
  //     errors.value.heroId = 'Pilih hero terlebih dahulu';
  //   }
  // } else if (currentStep.value === 2) {
  //   if (!skillForm.value.lite_description.trim()) {
  //     errors.value.lite_description = 'Kolom deskripsi singkat tidak boleh kosong';
  //   }
  // }
  if (Object.keys(errors.value).length === 0) {
    if (currentStep.value < 4) currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--;
}

// function handleSubmit() {
//   alert('Data berhasil disimpan:\n' + JSON.stringify(formData.value, null, 2));
// }
const editSkill = ref<any>({});
const editTag = ref<string[]>([]);
const editTagEdit = ref<string[]>([]);
const tagOptions = ['Buff', 'CC', 'Area Efek', 'Conceal', 'Heal', 'Blink'];

const { result: skillResult } = useSkills();
type Skill = {
  id: number;
  name: string;
  lite_description: string;
};

type Hero = {
  name: string;
  skills: Skill[];
};

const skills = computed(() => {
  return skillResult.value?.heroes
    ?.flatMap((hero: Hero) => hero.skills.map(skill => ({
      heroName: hero.name,
      ...skill
    }))) || [];
});

const { result: skillDetailResult } = useSkillsDetail();
type SkillDetail = {
  id: number;
  level: number;
  attributes: Record<string, any>;
};

type Skills = {
  name: string;
  skills_detail?: SkillDetail[];
};

const getSkillDetails = computed(() => {
  if (!skillDetailResult.value?.skills) return [];
  return skillDetailResult.value.skills.flatMap((skill: Skills) =>
    (skill.skills_detail ?? []).map((skill_detail: SkillDetail) => ({
      skillName: skill.name,
      ...skill_detail
    }))
  );
});

const selectedSkillName = ref('');
const showSkillDetailModal = ref(false);

function openSkillDetail(skillName: string) {
  selectedSkillName.value = skillName;
  showSkillDetailModal.value = true;
}
function closeSkillDetail() {
  showSkillDetailModal.value = false;
}

interface SelectedSkillDetail {
  skillName: string;
  id: string | number;
  level: number;
  attributes: Record<string, any>;
}

const selectedSkillDetails = computed<SelectedSkillDetail[]>(() => {
  if (!selectedSkillName.value) return [];
  return getSkillDetails.value.filter(
    (detail: SelectedSkillDetail) => detail.skillName === selectedSkillName.value
  );
});

const dynamicAttributeKeys = computed(() => {
  if (selectedSkillDetails.value.length === 0) return [];
  // Ambil semua key dari semua attribute, lalu dedup
  const allKeys = selectedSkillDetails.value.flatMap(detail =>
    Object.keys(detail.attributes || {})
  );
  return [...new Set(allKeys)];
});

const resetForm = () => {
  skillForm.value = {
    heroId: '',
    name: '',
    type: '',
    tag: [],
    // attack_effect: '',
    skill_icon: '',
    lite_description: '',
    full_description: '',
  };
  editTag.value = [];
};

function handleTagChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  if ((e.target as HTMLInputElement).checked) {
    if (editTag.value.length < 2) {
      editTag.value.push(value);
    } else {
      (e.target as HTMLInputElement).checked = false;
    }
  } else {
    editTag.value = editTag.value.filter(t => t !== value);
  }
}

const handleAddSkill = async () => {
  isSubmitting.value = true;
  try {
    if (!skillForm.value.heroId) {
      alertError('Pilih hero terlebih dahulu.');
      isSubmitting.value = false;
      return;
    }
    await addSkillToHero({
      heroId: skillForm.value.heroId,
      input: {
        name: skillForm.value.name,
        type: skillForm.value.type,
        tag: [...editTag.value],
        skill_icon: skillForm.value.skill_icon,
        lite_description: skillForm.value.lite_description,
        full_description: skillForm.value.full_description,
      }
    });
    await refetch();
    alertSuccess('Skill berhasil ditambahkan');
    (window as any).bootstrap?.Modal.getOrCreateInstance(document.getElementById('add-hero-skill'))?.hide();
    resetForm();
  } catch (error) {
    alertError('Gagal menambahkan skill. Pastikan semua field terisi dengan benar.');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

function openEditModal(skill: any) {
  editSkill.value = { ...skill };
  editTagEdit.value = Array.isArray(skill.tag) ? [...skill.tag] : skill.tag ? [skill.tag] : [];
}

const handleEditSkill = async () => {
  isSubmitting.value = true;
  try {
    const input = {
      name: editSkill.value.name,
      type: editSkill.value.type,
      tag: [...editTagEdit.value],
      skill_icon: editSkill.value.skill_icon,
      lite_description: editSkill.value.lite_description,
      full_description: editSkill.value.full_description,
    };
    await updateSkill({ id: editSkill.value._id, input });
    await refetch();
    alertSuccess('Skill berhasil diupdate');
    (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-skill'))?.hide();
    resetForm();
    editTagEdit.value = [];
  } catch (error) {
    alertError('Gagal mengupdate skill. Pastikan semua field terisi dengan benar.');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteSkill = async (id: string) => {
  const confirm = await alertConfirm('Yakin ingin menghapus skill ini? Data skill akan dihapus permanen!');
  if (confirm == true) {
    try {
      await deleteSkill({ id });
      await refetch();
      alertSuccess('Skill berhasil dihapus');
    } catch (error) {
      alertError('Gagal menghapus skill. Pastikan skill tidak sedang digunakan.');
    }
  }
}

const levelCount = ref<number>(0);
const attributeCount = ref<number>(0);

const inputs = computed(() => {
  return Array.from({ length: attributeCount.value }, () =>
    Array.from({ length: levelCount.value }, () => '')
  );
});

const formValues = ref<string[][]>([]);

// Array untuk nama attribute
const attributeKeys = ref<string[]>([]);

// Update formValues dan attributeKeys ketika jumlah level/attribute berubah
watch([levelCount, attributeCount], () => {
  formValues.value = Array.from({ length: attributeCount.value }, () =>
    Array.from({ length: levelCount.value }, () => '')
  );
  attributeKeys.value = Array.from({ length: attributeCount.value }, () => '');
});

const generateSkillDetailInput = () => {
  return Array.from({ length: levelCount.value }, (_, levelIndex) => {
    const attributes: Record<string, number> = {};
    attributeKeys.value.forEach((key, attrIdx) => {
      const rawValue = formValues.value[attrIdx][levelIndex];
      const parsed = parseFloat(rawValue);
      attributes[key] = isNaN(parsed) ? 0 : parsed;
    });

    return {
      level: levelIndex + 1,
      attributes,
    };
  });
};
// const handleSubmit = async () => {
//   const input = generateSkillDetailInput();
//   try {
//     await addSkillDetailToSkill({
//       skillId: skillId.value,
//       input,
//     });
//     console.log('Data berhasil dikirim!');
//   } catch (error) {
//     console.error('Gagal mengirim data:', error);
//   }
// };

const handleAddSkillWizard = async () => {
  isSubmitting.value = true;
  try {
    // 1. Tambah skill utama
    const addSkillRes = await addSkillToHero({
      heroId: skillForm.value.heroId,
      input: {
        name: skillForm.value.name,
        type: skillForm.value.type,
        tag: [...editTag.value],
        skill_icon: skillForm.value.skill_icon,
        lite_description: skillForm.value.lite_description,
        full_description: skillForm.value.full_description,
      }
    });

    // Ambil ID skill yang baru dibuat
    const newSkillId =
      addSkillRes?.data?.addSkillToHero?._id ||
      addSkillRes?.data?.addSkillToHero?.id;

    if (!newSkillId) {
      alertError('Gagal mendapatkan ID skill baru.');
      isSubmitting.value = false;
      return;
    }

    // 2. Tambah detail skill
    const detailInput = generateSkillDetailInput();
    await addSkillDetailToSkill({
      skillId: newSkillId,
      input: detailInput,
    });

    await refetch();
    alertSuccess('Skill dan detail berhasil ditambahkan');
    (window as any).bootstrap?.Modal.getOrCreateInstance(document.getElementById('add-hero-skill'))?.hide();
    resetForm();
  } catch (error) {
    alertError('Gagal menambahkan skill atau detail. Pastikan semua field terisi dengan benar.');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <div class="card bg-light-info shadow-none position-relative overflow-hidden">
      <div class="card-body px-4 py-3">
        <div class="row align-items-center">
          <div class="col-9">
            <h4 class="fw-semibold mb-8">Data Skill</h4>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a class="text-muted " href="/dashboard">Dashboard</a></li>
                <li class="breadcrumb-item" aria-current="page">Data Hero</li>
                <li class="breadcrumb-item" aria-current="page">Skill</li>
              </ol>
            </nav>
          </div>
          <div class="col-3">
            <div class="text-center mb-n5">
              <img src="/dist/images/breadcrumb/ChatBc.png" alt="" class="img-fluid mb-n4">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Skill Hero</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-info btn-rounded m-t-10 mb-2"
                data-bs-toggle="modal"
                data-bs-target="#add-hero-skill"
              >
                Tambah Data Skill
              </button>
            </div>
            <div
              id="add-hero-skill"
              class="modal fade"
              tabindex="-1"
              role="dialog"
              aria-labelledby="myLargeModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-dialog-scrollable modal-xl">
                <div class="modal-content">
                  <div class="modal-header d-flex align-items-center">
                    <h4 class="modal-title" id="myModalLabel">
                      Tambah Data Skill Hero
                    </h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <div class="col-12">
                      <div class="card">
                        <div class="card-body wizard-content">
                          <form class="form-horizontal form-material" @submit.prevent="handleAddSkill">
                            <div class="form-group">
                              <div v-if="currentStep === 1">
                                <h5>1. Data Dasar</h5>
                                <div class="row pt-2">
                                <div class="col-md-12">
                                  <div class="mb-3">
                                    <label class="control-label">Nama Hero</label>
                                    <select class="form-select" required v-model="skillForm.heroId">
                                      <option value="">Pilih Hero</option>
                                      <option v-for="hero in heroes" :key="hero._id" :value="hero._id">{{ hero.name }}</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                                <div class="row">
                                  <div class="col-md-6 col-lg-4">
                                    <div class="mb-3">
                                      <label class="control-label">Nama Skill</label>
                                      <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Nama Skill"
                                        required v-model="skillForm.name"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-md-6 col-lg-4">
                                    <div class="mb-3">
                                      <label class="control-label">Tipe</label>
                                      <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Tipe"
                                        required v-model="skillForm.type"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-md-6 col-lg-4">
                                    <div class="mb-3">
                                      <label class="control-label">Efek Basic Attack</label>
                                      <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Efek Basic Attack"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div class="row">
                                  <div class="col-md-4">
                                    <div class="mb-3">
                                      <label class="control-label">Skill Icon</label>
                                      <input
                                        type="text"
                                        class="form-control"
                                        placeholder="Skill Icon URL"
                                        required v-model="skillForm.skill_icon"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-md-8">
                                    <div class="mb-3">
                                      <label class="control-label">Tag</label>
                                      <div class="row">
                                        <template v-for="option in tagOptions" :key="option">
                                          <div class="col-md-3 py-2">
                                            <div class="form-check form-check-inline">
                                              <input class="form-check-input primary" type="checkbox" id="primary-check" 
                                              :value="option"
                                              :checked="editTag.includes(option)"
                                              @change="handleTagChange">
                                              <label class="form-check-label" for="primary-check">{{option}}</label>
                                            </div>
                                          </div>
                                        </template>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="row">
                                  <div class="col-md-4">
                                    <div class="mb-3">
                                      <label class="control-label">Deskripsi Singkat</label>
                                      <textarea
                                        id="short_description"
                                        class="form-control"
                                        rows="5"
                                        placeholder="Deskripsi Singkat Hero"
                                        required v-model="skillForm.lite_description"
                                      ></textarea>
                                    </div>
                                  </div>
                                  <div class="col-md-8">
                                    <div class="mb-3">
                                      <label class="control-label">Deskripsi Lengkap</label>
                                      <textarea
                                        id="short_description"
                                        class="form-control"
                                        rows="5"
                                        placeholder="Deskripsi Lengkap Hero"
                                        required v-model="skillForm.full_description"
                                      ></textarea>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div v-if="currentStep === 2">
                                <h5>2. Data Detail</h5>
                                <div class="row pt-2">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="control-label">Jumlah Level Skill</label>
                                      <input
                                        type="number"
                                        class="form-control"
                                        placeholder="Level Skill"
                                        required v-model.number="levelCount" min="1"
                                      />
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="control-label">Jumlah Attribut</label>
                                      <input
                                        type="number"
                                        class="form-control"
                                        placeholder="Level Skill"
                                        required v-model.number="attributeCount" min="1"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div v-if="levelCount > 0 && attributeCount > 0" class="table-responsive">
                                  <table class="table table-bordered">
                                    <thead>
                                      <tr class="text-center">
                                        <th>Attribute / Level</th>
                                        <th v-for="level in levelCount" :key="level">Level {{ level }}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr v-for="(row, attrIdx) in formValues" :key="attrIdx">
                                        <td>
                                          <input
                                            v-model="attributeKeys[attrIdx]"
                                            type="text"
                                            placeholder="Nama Attribute"
                                            class="form-control"
                                          />
                                        </td>
                                        <td v-for="(val, lvlIdx) in row" :key="lvlIdx">
                                          <input v-model="formValues[attrIdx][lvlIdx]" type="text" class="form-control" />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div v-if="currentStep === 3">
                              <h5>Langkah 3: Konfirmasi</h5>
                              <p>Periksa kembali data yang telah Anda isi:</p>
                              <ul>
                                <li><strong>Nama Hero:</strong> {{ skillForm.heroId }}</li>
                                <li><strong>Nama Skill:</strong> {{ skillForm.name }}</li>
                                <li><strong>Tipe:</strong> {{ skillForm.type }}</li>
                                <li><strong>Deskripsi Singkat:</strong> {{ skillForm.lite_description }}</li>
                                <li><strong>Deskripsi Lengkap:</strong> {{ skillForm.full_description }}</li>
                                <li><strong>Ikon Skill:</strong> {{ skillForm.skill_icon }}</li>
                                <li><strong>Tag:</strong> {{ editTag.join(', ') }}</li>
                              </ul>
                              <h6 class="mt-4 mb-2">Preview Data Skill Detail</h6>
                              <table class="table table-bordered">
                                <thead>
                                  <tr>
                                    <th class="text-center">Level</th>
                                    <th v-for="key in attributeKeys" :key="key" class="text-center">{{ key }}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(detail, i) in generateSkillDetailInput()" :key="i">
                                    <td class="text-center">{{ detail.level }}</td>
                                    <td v-for="key in attributeKeys" :key="key" class="text-center">
                                      {{ detail.attributes[key] ?? '-' }}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <button type="button" class="btn btn-success" @click="handleAddSkillWizard" :disabled="isSubmitting">
                                Simpan
                              </button>
                            </div>
                              <div class="d-flex justify-content-end gap-2 mb-4">
                                <button type="button" class="btn btn-outline-primary" :disabled="currentStep === 1" @click="prevStep">Sebelumnya</button>
                                <button type="button" class="btn btn-outline-primary" :disabled="currentStep === 3" @click="nextStep">Selanjutnya</button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="table-responsive">
              <table
                id="demo-foo-addrow"
                class="
                  table table-bordered
                  m-t-30
                  table-hover
                  hero-list
                "
                data-paging="true"
                data-paging-size="7"
              >
                <thead>
                  <tr class="text-center">
                    <th>No</th>
                    <th>Nama Hero</th>
                    <th>Ikon</th>
                    <th>Nama Skill</th>
                    <th>Tipe Skill</th>
                    <th>Tag</th>
                    <!-- <th>Deskripsi Singkat</th> -->
                    <td>Aksi</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(skill, index) in skills" :key="skill._id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td class="text-center">{{ skill.heroName }}</td>
                    <td class="text-center">
                      <img :src="skill.skill_icon" alt="" class="img-fluid" style="width: 50px; height: 50px;">
                    </td>
                    <td class="text-center">{{ skill.name }}</td>
                    <td class="text-center">{{ skill.type }}</td>
                    <td class="text-center">
                      <span v-for="(tag, i) in Array.isArray(skill.tag) ? skill.tag : [skill.tag]"
                        :key="i" class="badge bg-primary me-1">{{ tag }}
                      </span>
                    </td>
                    <!-- <td class="text-center">{{ skill.lite_description }}</td> -->
                    <td class="text-center">
                      <button class="btn btn-md btn-secondary mx-1"
                        data-bs-toggle="modal"
                        data-bs-target="#skill-detail"
                        @click="openSkillDetail(skill.name)"
                      >Detail</button>
                      <div class="modal fade" id="skill-detail" tabindex="-1"
                        aria-labelledby="bs-example-modal-lg"
                        aria-hidden="true">
                        <div class="modal-dialog modal-xl">
                          <div class="modal-content">
                            <div class="modal-header d-flex">
                              <h4 class="modal-title" id="myLargeModalLabel1">
                                Edit Data Skill
                              </h4>
                              <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <div class="modal-body text-start">
                              <h5 class="mb-3">Detail Skill: {{ selectedSkillName }}</h5>
                              <table class="table table-bordered">
                                <thead>
                                  <tr>
                                    <th class="text-center">Level</th>
                                    <th
                                      v-for="key in dynamicAttributeKeys"
                                      :key="key"
                                      class="text-center"
                                    >
                                      {{ key }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr
                                    v-for="(detail, i) in selectedSkillDetails"
                                    :key="i"
                                  >
                                    <td class="text-center">{{ detail.level }}</td>
                                    <td
                                      v-for="key in dynamicAttributeKeys"
                                      :key="key"
                                      class="text-center"
                                    >
                                      {{ detail.attributes[key] ?? '-' }}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button class="btn btn-md btn-primary mx-1"
                      data-bs-toggle="modal"
                      data-bs-target="#edit-skill"
                      @click="openEditModal(skill)">Edit</button>
                      <div
                        class="modal fade"
                        id="edit-skill"
                        tabindex="-1"
                        aria-labelledby="bs-example-modal-lg"
                        aria-hidden="true"
                      >
                        <div class="modal-dialog modal-xl">
                          <div class="modal-content">
                            <div class="modal-header d-flex">
                              <h4 class="modal-title" id="myLargeModalLabel1">
                                Edit Data Skill
                              </h4>
                              <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <div class="modal-body text-start">
                                <form class="form-horizontal form-material" @submit.prevent="handleEditSkill">
                                  <div>
                                    <div class="card-body">
                                      <h5>Data Hero</h5>
                                      <div class="row pt-3">
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Nama Skill</label>
                                            <input
                                              type="text"
                                              id="name"
                                              class="form-control"
                                              placeholder="Nama Skill"
                                              v-model="editSkill.name"
                                            />
                                          </div>
                                        </div>
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Tipe</label>
                                            <input
                                              type="text"
                                              id="type"
                                              class="form-control"
                                              placeholder="Alias hero"
                                              v-model="editSkill.type"
                                            />
                                          </div>
                                        </div>
                                        <div class="col-md-12 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Skill Icon</label>
                                            <input
                                              type="text"
                                              class="form-control"
                                              placeholder="Skill Icon URL"
                                              required v-model="editSkill.skill_icon"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div class="row">
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Role</label>
                                            <div class="row">
                                              <template v-for="(option, index) in tagOptions" :key="'edit-tag-' + option">
                                                <div class="col-md-6 py-2">
                                                  <div class="form-check form-check-inline">
                                                    <input
                                                      class="form-check-input primary"
                                                      type="checkbox"
                                                      :id="'edit-tag-' + index"
                                                      :value="option"
                                                      :checked="editTagEdit.includes(option)"
                                                      @change="e => {
                                                        const value = (e.target as HTMLInputElement).value;
                                                        if ((e.target as HTMLInputElement).checked) {
                                                          if (editTagEdit.length < 2) editTagEdit.push(value);
                                                          else (e.target as HTMLInputElement).checked = false;
                                                        } else {
                                                          editTagEdit.splice(editTagEdit.indexOf(value), 1);
                                                        }
                                                      }"
                                                    />
                                                    <label class="form-check-label" :for="'edit-tag-' + index">{{ option }}</label>
                                                  </div>
                                                </div>
                                              </template>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Deskripsi Singkat</label>
                                            <textarea
                                              id="short_description"
                                              class="form-control"
                                              rows="5"
                                              placeholder="Deskripsi Singkat Hero"
                                              v-model="editSkill.lite_description"
                                              required  
                                            ></textarea>
                                          </div>
                                        </div>
                                        <div class="col-md-12 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Deskripsi Lengkap</label>
                                            <textarea
                                              id="full_description"
                                              class="form-control"
                                              rows="5"
                                              placeholder="Deskripsi Lengkap Skill"
                                              v-model="editSkill.full_description"
                                              required  
                                            ></textarea>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="modal-footer">
                                    <button
                                      type="submit"
                                      class="btn btn-info waves-effect"
                                      :disabled="isSubmitting"
                                    >
                                      {{ isSubmitting ? 'Saving...' : 'Save' }}
                                    </button>
                                    <button
                                      type="button"
                                      class="btn btn-default waves-effect"
                                      data-bs-dismiss="modal"
                                      @click="resetForm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </div>
                          </div>
                        </div>
                      </div>
                      <button class="btn btn-md btn-danger mx-1" @click="handleDeleteSkill(skill._id)">Hapus</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
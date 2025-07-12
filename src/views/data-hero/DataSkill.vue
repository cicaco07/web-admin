<script setup lang="ts">
import { computed, ref } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import { useAddSkillToHero, useDeleteSkill, useSkills, useUpdateSkill } from '../../lib/api/SkillApi.ts';
import { useHeroes, } from '../../lib/api/HeroApi.ts';
import Swal from 'sweetalert2';

const { result: heroResult, refetch } = useHeroes();
const heroes = computed(() => heroResult.value?.heroes || []);

const { addSkillToHero } = useAddSkillToHero();
const { updateSkill } = useUpdateSkill();
const { deleteSkill } = useDeleteSkill();

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

// const currentStep = ref(1);

// const formData = ref({
//   name: '',
//   type: '',
//   description: '',
//   skillIcon: '',
//   tags: '',
// });

// function validateStep(step: number) {
//   if (step === 1) {
//     return formData.value.name.trim() !== '' && formData.value.type.trim() !== '';
//   } else if (step === 2) {
//     return formData.value.description.trim() !== '';
//   } else if (step === 3) {
//     return formData.value.skillIcon.trim() !== '' && formData.value.tags.trim() !== '';
//   }
//   return true; // Step 4 tidak perlu validasi karena konfirmasi saja
// }

// function nextStep() {
//   if (validateStep(currentStep.value)) {
//     if (currentStep.value < 4) currentStep.value++;
//   } else {
//     alert('Mohon isi semua field yang diperlukan sebelum melanjutkan.');
//   }
// }

// function prevStep() {
//   if (currentStep.value > 1) currentStep.value--;
// }

// function handleSubmit() {
//   alert('Data berhasil disimpan:\n' + JSON.stringify(formData.value, null, 2));
// }
const editSkill = ref<any>({});
const editTag = ref<string[]>([]);
const editTagEdit = ref<string[]>([]);
const tagOptions = ['Buff', 'CC', 'Area Efek', 'Conceal', 'Heal', 'Blink'];

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

const { result: skillResult } = useSkills();
type Skill = {
  id: number;
  name: string;
  skill_icon: string;
  type: string;
  tag: { id: number; name: string }[];
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

const handleAddSkill = async () => {
  isSubmitting.value = true;

  try {
    if (!skillForm.value.heroId) {
      Swal.fire('Gagal', 'Pilih hero terlebih dahulu.', 'error');
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
    Swal.fire({
      icon: 'success',
      title: 'Skill berhasil ditambahkan',
      showConfirmButton: false,
      timer: 1500
    });
    (window as any).bootstrap?.Modal.getOrCreateInstance(document.getElementById('add-hero-skill'))?.hide();
    resetForm();
  } catch (error) {
    Swal.fire('Gagal', 'Gagal menambahkan skill.', 'error');
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
    Swal.fire('Berhasil', 'Data skill berhasil diupdate.', 'success');
    (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-skill'))?.hide();
    resetForm();
    editTagEdit.value = [];
  } catch (error) {
    Swal.fire('Gagal', 'Gagal mengupdate skill.', 'error');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteSkill = async (id: string) => {
  const confirm = await Swal.fire({
    title: 'Yakin hapus?',
    text: 'Data skill akan dihapus permanen!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  });

  if (confirm.isConfirmed) {
    try {
      await deleteSkill({ id });
      await refetch();
      Swal.fire('Terhapus!', 'Data skill berhasil dihapus.', 'success');
    } catch (error) {
      Swal.fire('Gagal!', 'Gagal menghapus data.', 'error');
    }
  }
}
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
                              <div class="row">
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
                              <div class="row pt-3">
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
                                <!-- <div class="col-md-6 col-lg-4">
                                  <div class="mb-3">
                                    <label class="control-label">Efek Basic Attack</label>
                                    <input
                                      type="text"
                                      class="form-control"
                                      placeholder="Efek Basic Attack"
                                    />
                                  </div>
                                </div> -->
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
                            <div class="modal-footer">
                              <button
                                type="submit"
                                class="btn btn-info waves-effect"
                                
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                class="btn btn-default waves-effect"
                                data-bs-dismiss="modal"
                                
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                          <!-- <form @submit.prevent="handleSubmit">
                            <div>Langkah {{ currentStep }} dari 4</div>

                            
                            <div v-if="currentStep === 1">
                              <h5>Langkah 1: Data Dasar</h5>
                              <div class="row">
                                <div class="col-md-6 mb-3">
                                  <label>Nama Skill</label>
                                  <input v-model="formData.name" type="text" class="form-control" required />
                                </div>
                                <div class="col-md-6 mb-3">
                                  <label>Tipe Skill</label>
                                  <input v-model="formData.type" type="text" class="form-control" required />
                                </div>
                              </div>
                            </div>
                            
                            <div v-if="currentStep === 2">
                              <h6>Step 1</h6>
                              <section>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label for="wfirstName2"> First Name : <span class="danger">*</span>
                                      </label>
                                      <input type="text" class="form-control required" id="wfirstName2" name="firstName" />
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label for="wlastName2"> Last Name : <span class="danger">*</span>
                                      </label>
                                      <input type="text" class="form-control required" id="wlastName2" name="lastName" />
                                    </div>
                                  </div>
                                </div>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label for="wemailAddress2"> Email Address : <span class="danger">*</span>
                                      </label>
                                      <input type="email" class="form-control required" id="wemailAddress2" name="emailAddress" />
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label for="wphoneNumber2">Phone Number :</label>
                                      <input type="tel" class="form-control" id="wphoneNumber2" />
                                    </div>
                                  </div>
                                </div>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label for="wlocation2"> Select City : <span class="danger">*</span>
                                      </label>
                                      <select class="form-select required" id="wlocation2" name="location">
                                        <option value="">Select City</option>
                                        <option value="India">India</option>
                                        <option value="USA">USA</option>
                                        <option value="Dubai">Dubai</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label for="wdate2">Date of Birth :</label>
                                      <input type="date" class="form-control" id="wdate2" />
                                    </div>
                                  </div>
                                </div>
                              </section>
                            </div>
                            
                            <div v-if="currentStep === 3">
                              <h5>Langkah 3: Gambar dan Tag</h5>
                              <input v-model="formData.skillIcon" type="text" class="form-control mb-2" placeholder="URL Ikon Skill" required />
                              <input v-model="formData.tags" type="text" class="form-control" placeholder="Tag (pisahkan koma)" required />
                            </div>

                            <div v-if="currentStep === 4">
                              <h5>Langkah 4: Konfirmasi</h5>
                              <p>Periksa kembali data yang telah Anda isi:</p>
                              <ul>
                                <li><strong>Nama:</strong> {{ formData.name }}</li>
                                <li><strong>Tipe:</strong> {{ formData.type }}</li>
                                <li><strong>Deskripsi:</strong> {{ formData.description }}</li>
                                <li><strong>Ikon:</strong> {{ formData.skillIcon }}</li>
                                <li><strong>Tags:</strong> {{ formData.tags }}</li>
                              </ul>
                              <button type="submit" class="btn btn-success">Simpan</button>
                            </div>
                            <div class="d-flex justify-content-between mb-4">
                              <button type="button" class="btn btn-outline-primary" :disabled="currentStep === 1" @click="prevStep">Sebelumnya</button>
                              
                              <button type="button" class="btn btn-outline-primary" :disabled="currentStep === 4" @click="nextStep">Selanjutnya</button>
                            </div>
                          </form> -->
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
                      <button class="btn btn-md btn-secondary mx-1">Detail</button>
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
                            <div
                              class="modal-header d-flex"
                            >
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
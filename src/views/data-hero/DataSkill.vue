<script setup lang="ts">
import { computed, ref } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import { useSkills } from '../../lib/api/SkillApi.ts';

const currentStep = ref(1);

const formData = ref({
  name: '',
  type: '',
  description: '',
  skillIcon: '',
  tags: '',
});

// Validasi setiap langkah
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

function handleSubmit() {
  alert('Data berhasil disimpan:\n' + JSON.stringify(formData.value, null, 2));
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
                  <tr v-for="(skill, index) in skills" :key="skill.id">
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
                      <button class="btn btn-md btn-primary mx-1">Edit</button>
                      <button class="btn btn-md btn-danger mx-1">Hapus</button>
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
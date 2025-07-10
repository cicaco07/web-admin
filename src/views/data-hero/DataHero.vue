<script setup lang="ts">
import { ref, computed } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
// import {alertConfirm} from "../../lib/alert.ts";
import Swal from 'sweetalert2';
import { useHeroes, useCreateHero, useUpdateHero, useDeleteHero } from '../../lib/api/HeroApi.ts';

const { result: heroResult, refetch } = useHeroes();
const heroes = computed(() => heroResult.value?.heroes || []);

const { createHero } = useCreateHero();
const { updateHero } = useUpdateHero();
const { deleteHero } = useDeleteHero();

const isSubmitting = ref(false);

const heroForm = ref({
  name: '',
  alias: '',
  role: [],
  type: [],
  short_description: '',
  avatar: '',
  image: '',
  release_date: '',
  durability: '',
  offense: '',
  control_effect: '',
  difficulty: ''
});

const editHero = ref<any>({});
const editRoleEdit = ref<string[]>([]);
const editTypeEdit = ref<string[]>([]);

const editRole = ref<string[]>([]);
const editType = ref<string[]>([]);

const typeOptions = ['Tank', 'Assassin', 'Fighter', 'Marksman', 'Mage', 'Support'];
const roleOptions = ['Roam', 'Jungle', 'Midlane', 'Explane', 'Goldlane'];

// FUNGSI BANTUAN
function handleTypeChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  if ((e.target as HTMLInputElement).checked) {
    if (editType.value.length < 2) {
      editType.value.push(value);
    } else {
      (e.target as HTMLInputElement).checked = false;
    }
  } else {
    editType.value = editType.value.filter(t => t !== value);
  }
}

function handleRoleChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  if ((e.target as HTMLInputElement).checked) {
    if (editRole.value.length < 2) {
      editRole.value.push(value);
    } else {
      (e.target as HTMLInputElement).checked = false;
    }
  } else {
    editRole.value = editRole.value.filter(r => r !== value);
  }
}

const resetForm = () => {
  heroForm.value = {
    name: '',
    alias: '',
    role: [],
    type: [],
    short_description: '',
    avatar: '',
    image: '',
    release_date: '',
    durability: '',
    offense: '',
    control_effect: '',
    difficulty: ''
  };
  editType.value = [];
  editRole.value = [];
};

const handleAddHero = async () => {
  isSubmitting.value = true;
  try {
    const input = {
      ...heroForm.value,
      role: [...editRole.value],
      type: [...editType.value]
    };
    await createHero({ input });
    await refetch();
    Swal.fire('Berhasil', 'Hero berhasil ditambahkan!', 'success');
    (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-hero'))?.hide();
    resetForm();
    editRole.value = [];
    editType.value = [];
  } catch (error) {
    Swal.fire('Gagal', 'Gagal menambahkan hero.', 'error');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

function openEditModal(hero: any) {
  let formattedReleaseDate = hero.release_date;
  if (formattedReleaseDate && typeof formattedReleaseDate === 'string') {
    formattedReleaseDate = formattedReleaseDate.slice(0, 10);
  }
  editHero.value = { ...hero, release_date: formattedReleaseDate };
  editRoleEdit.value = Array.isArray(hero.role) ? [...hero.role] : hero.role ? [hero.role] : [];
  editTypeEdit.value = Array.isArray(hero.type) ? [...hero.type] : hero.type ? [hero.type] : [];
}

const handleEditHero = async () => {
  isSubmitting.value = true;
  try {
    const input = {
      name: editHero.value.name,
      alias: editHero.value.alias,
      role: [...editRoleEdit.value],
      type: [...editTypeEdit.value],
      short_description: editHero.value.short_description,
      avatar: editHero.value.avatar,
      image: editHero.value.image,
      release_date: editHero.value.release_date,
      durability: Number(editHero.value.durability),
      offense: Number(editHero.value.offense),
      control_effect: Number(editHero.value.control_effect),
      difficulty: Number(editHero.value.difficulty)
    };
    await updateHero({ id: editHero.value._id, input });
    await refetch();
    Swal.fire('Berhasil', 'Data hero berhasil diupdate.', 'success');
    (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-hero'))?.hide();
    resetForm();
    editRoleEdit.value = [];
    editTypeEdit.value = [];
  } catch (error) {
    Swal.fire('Gagal', 'Gagal mengupdate hero.', 'error');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteHero = async (id: string) => {
  const confirm = await Swal.fire({
    title: 'Yakin hapus?',
    text: 'Data hero akan dihapus permanen!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  });

  if (confirm.isConfirmed) {
    try {
      await deleteHero({ id });
      await refetch();
      Swal.fire('Terhapus!', 'Data hero berhasil dihapus.', 'success');
    } catch (error) {
      Swal.fire('Gagal!', 'Gagal menghapus data.', 'error');
    }
  }
};

</script>

<template>
  <DashboardLayout>
    <div class="card bg-light-info shadow-none position-relative overflow-hidden">
      <div class="card-body px-4 py-3">
        <div class="row align-items-center">
          <div class="col-9">
            <h4 class="fw-semibold mb-8">Data Hero</h4>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><a class="text-muted " href="/dashboard">Dashboard</a></li>
                <li class="breadcrumb-item" aria-current="page">Data Hero</li>
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
            <h4 class="card-title mb-0">Daftar Hero</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-info btn-rounded m-t-10 mb-2"
                data-bs-toggle="modal"
                data-bs-target="#add-hero"
              >
                Tambah Data Hero
              </button>
            </div>
            <!-- Add Contact Popup Model -->
            <div
              id="add-hero"
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
                      Tambah Data Hero
                    </h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form class="form-horizontal form-material" @submit.prevent="handleAddHero">
                      <div class="form-group">
                        <div class="row pt-3">
                          <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                              <label class="control-label">Nama</label>
                              <input
                                type="text"
                                class="form-control"
                                placeholder="name"
                                v-model="heroForm.name"
                                required
                              />
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                              <label class="control-label">Alias</label>
                              <input
                                type="text"
                                class="form-control"
                                placeholder="Alias"
                                v-model="heroForm.alias"
                                required
                              />
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                              <label class="control-label">Tanggal Rilis</label>
                              <input type="date" class="form-control" v-model="heroForm.release_date"/>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                              <label class="control-label">Role</label>
                              <div class="row">
                                <template v-for="option in roleOptions" :key="option">
                                  <div class="col-md-6 py-2">
                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input primary" type="checkbox" id="primary-check" 
                                      :value="option"
                                      :checked="editRole.includes(option)"
                                      @change="handleRoleChange">
                                      <label class="form-check-label" for="primary-check">{{option}}</label>
                                    </div>
                                  </div>
                                </template>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6 col-lg-4">
                            <div class="mb-3">
                              <label class="control-label">Tipe</label>
                              <div class="row">
                                  <template v-for="option in typeOptions" :key="option">
                                  <div class="col-md-6 py-2">
                                    <div class="form-check form-check-inline">
                                      <input class="form-check-input primary" type="checkbox" id="primary-check" 
                                      :value="option"
                                      :checked="editType.includes(option)"
                                      @change="handleTypeChange">
                                      <label class="form-check-label" for="primary-check">{{option}}</label>
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
                                v-model="heroForm.short_description"
                                required
                              ></textarea>
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label class="control-label">Gambar</label>
                              <input
                                type="text"
                                class="form-control"
                                placeholder="Avatar URL"
                                v-model="heroForm.image"
                                required
                              />
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label class="control-label">Avatar</label>
                              <input
                                type="text"
                                class="form-control"
                                placeholder="Avatar URL"
                                v-model="heroForm.avatar"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-sm-6 col-md-4 col-lg-3">
                            <div class="mb-3">
                              <label class="control-label">Durability</label>
                              <div class="form-group">
                                <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="heroForm.durability"/>
                              </div>
                            </div>
                          </div>
                          <div class="col-sm-6 col-md-4 col-lg-3">
                            <div class="mb-3">
                              <label class="control-label">Offense</label>
                              <div class="form-group">
                                <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="heroForm.offense"/>
                              </div>
                            </div>
                          </div>
                          <div class="col-sm-6 col-md-4 col-lg-3">
                            <div class="mb-3">
                              <label class="control-label">Control Effect</label>
                              <div class="form-group">
                                <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="heroForm.control_effect"/>
                              </div>
                            </div>
                          </div>
                          <div class="col-sm-6 col-md-4 col-lg-3">
                            <div class="mb-3">
                              <label class="control-label">Difficulty</label>
                              <div class="form-group">
                                <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="heroForm.difficulty"/>
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
                    <th>Nama</th>
                    <th>Avatar</th>
                    <th>Alias</th>
                    <th>Role</th>
                    <th>Tipe</th>
                    <th>Deskripsi Singkat</th>
                    <th>Tanggal Rilis</th>
                    <td>Aksi</td>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(hero, index) in heroes"
                    :key="hero._id"
                    class="text-center align-items-center"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ hero.name }}</td>
                    <td>
                      <img :src="hero.avatar" class="w-50 rounded-circle" alt="Avatar">
                    </td>
                    <td>{{ hero.alias }}</td>
                    <td><span
                        v-for="(role, i) in Array.isArray(hero.role) ? hero.role : [hero.role]"
                        :key="i"
                        class="badge bg-danger me-1"
                      > 
                        {{ role }}
                      </span></td>
                    <td>
                      <span
                        v-for="(type, i) in Array.isArray(hero.type) ? hero.type : [hero.type]"
                        :key="i"
                        class="badge bg-danger me-1"
                      > 
                        {{ type }}
                      </span>
                    </td>
                    <td>{{ hero.short_description }}</td>
                    <td>{{ new Date(hero.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</td>
                    <td>
                      <div>
                        <button
                          class="btn me-1 mb-1 btn-light-warning text-warning btn-lg px-3 fs-3 font-medium"
                          data-bs-toggle="modal"
                          data-bs-target="#edit-hero"
                          @click="openEditModal(hero)"
                        >
                          Edit
                        </button>
                        <div
                          class="modal fade"
                          id="edit-hero"
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
                                  Edit Data Hero
                                </h4>
                                <button
                                  type="button"
                                  class="btn-close"
                                  data-bs-dismiss="modal"
                                  aria-label="Close"
                                ></button>
                              </div>
                              <div class="modal-body text-start">
                                <form class="form-horizontal form-material" @submit.prevent="handleEditHero">
                                  <div>
                                    <div class="card-body">
                                      <h5>Data Hero</h5>
                                      <div class="row pt-3">
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Nama</label>
                                            <input
                                              type="text"
                                              id="name"
                                              class="form-control"
                                              placeholder="Nama hero"
                                              v-model="editHero.name"
                                            />
                                          </div>
                                        </div>
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Alias</label>
                                            <input
                                              type="text"
                                              id="alias"
                                              class="form-control"
                                              placeholder="Alias hero"
                                              v-model="editHero.alias"
                                            />
                                          </div>
                                        </div>
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Tanggal Rilis</label>
                                            <input type="date" class="form-control" id="release_date" v-model="editHero.release_date"/>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="row">
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Role</label>
                                            <div class="row">
                                              <template v-for="(option, index) in roleOptions" :key="'edit-role-' + option">
                                                <div class="col-md-6 py-2">
                                                  <div class="form-check form-check-inline">
                                                    <input
                                                      class="form-check-input primary"
                                                      type="checkbox"
                                                      :id="'edit-role-' + index"
                                                      :value="option"
                                                      :checked="editRoleEdit.includes(option)"
                                                      @change="e => {
                                                        const value = (e.target as HTMLInputElement).value;
                                                        if ((e.target as HTMLInputElement).checked) {
                                                          if (editRoleEdit.length < 2) editRoleEdit.push(value);
                                                          else (e.target as HTMLInputElement).checked = false;
                                                        } else {
                                                          editRoleEdit.splice(editRoleEdit.indexOf(value), 1);
                                                        }
                                                      }"
                                                    />
                                                    <label class="form-check-label" :for="'edit-role-' + index">{{ option }}</label>
                                                  </div>
                                                </div>
                                              </template>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-md-6 col-lg-4">
                                          <div class="mb-3">
                                            <label class="control-label">Tipe</label>
                                            <div class="row">
                                                <template v-for="(option, index) in typeOptions" :key="'edit-type-' + option">
                                                <div class="col-md-6 py-2">
                                                  <div class="form-check form-check-inline">
                                                    <input
                                                      class="form-check-input primary"
                                                      type="checkbox"
                                                      :id="'edit-type-' + index"
                                                      :value="option"
                                                      :checked="editTypeEdit.includes(option)"
                                                      @change="e => {
                                                        const value = (e.target as HTMLInputElement).value;
                                                        if ((e.target as HTMLInputElement).checked) {
                                                          if (editTypeEdit.length < 2) editTypeEdit.push(value);
                                                          else (e.target as HTMLInputElement).checked = false;
                                                        } else {
                                                          editTypeEdit.splice(editTypeEdit.indexOf(value), 1);
                                                        }
                                                      }"
                                                    />
                                                    <label class="form-check-label" :for="'edit-type-' + index">{{ option }}</label>
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
                                              v-model="editHero.short_description"
                                              required  
                                            ></textarea>
                                          </div>
                                        </div>
                                      </div>
                                      <div class="row">
                                        <div class="col-md-6">
                                          <div class="mb-3">
                                            <label class="control-label">Gambar</label>
                                            <input
                                              type="text"
                                              class="form-control"
                                              placeholder="Avatar URL"
                                              v-model="editHero.image"
                                              required
                                            />
                                          </div>
                                        </div>
                                        <div class="col-md-6">
                                          <div class="mb-3">
                                            <label class="control-label">Avatar</label>
                                            <input
                                              type="text"
                                              class="form-control"
                                              placeholder="Avatar URL"
                                              v-model="editHero.avatar"
                                              required
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div class="row">
                                        <div class="col-sm-6 col-md-4 col-lg-3">
                                          <div class="mb-3">
                                            <label class="control-label">Durability</label>
                                            <div class="form-group">
                                              <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="editHero.durability"/>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-sm-6 col-md-4 col-lg-3">
                                          <div class="mb-3">
                                            <label class="control-label">Offense</label>
                                            <div class="form-group">
                                              <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="editHero.offense"/>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-sm-6 col-md-4 col-lg-3">
                                          <div class="mb-3">
                                            <label class="control-label">Control Effect</label>
                                            <div class="form-group">
                                              <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="editHero.control_effect"/>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-sm-6 col-md-4 col-lg-3">
                                          <div class="mb-3">
                                            <label class="control-label">Difficulty</label>
                                            <div class="form-group">
                                              <input type="number" class="form-control" min="1" max="10" placeholder="Range 1 - 10" v-model="editHero.difficulty"/>
                                            </div>
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
                        <button
                          class="btn btn-danger btn-lg px-3 fs-3 font-medium"
                          @click="handleDeleteHero(hero._id)"
                        >
                          Hapus
                        </button>
                      </div>
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
<script setup lang="ts">
import { ref, computed } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import { useHeroes, useCreateHero, useUpdateHero, useDeleteHero } from '../../lib/api/HeroApi.ts';
import Button from '../../components/Button/Button.vue';
import ModalButton from '../../components/Modal/ModalButton.vue';
import ModalHeader from '../../components/Modal/ModalHeader.vue';
import ModalBody from '../../components/Modal/ModalBody.vue';
import Modal from '../../components/Modal/Modal.vue';
import { alertConfirm, alertError, alertSuccess } from '../../lib/alert.ts';

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
    alertSuccess('Hero berhasil ditambahkan!');
    (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-hero'))?.hide();
    resetForm();
    editRole.value = [];
    editType.value = [];
  } catch (error) {
    alertError('Gagal menambahkan hero.');
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
    alertSuccess('Hero berhasil diupdate!');
    (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-hero'))?.hide();
    resetForm();
    editRoleEdit.value = [];
    editTypeEdit.value = [];
  } catch (error) {
    alertError('Gagal mengupdate hero.');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteHero = async (id: string) => {
  const confirm = await alertConfirm('Yakin ingin hapus hero ini? Data hero akan dihapus permanen!');
  if (confirm == true) {
    try {
      await deleteHero({ id });
      await refetch();
      alertSuccess('Data hero berhasil dihapus.');
    } catch (error) {
      alertError('Gagal menghapus data hero.');
      console.error(error);
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
                <li class="breadcrumb-item" aria-current="page">Hero</li>
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
              <ModalButton 
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-hero"
              >
                Tambah Data Hero
              </ModalButton>
            </div>
            <Modal
              id="add-hero"
              size="xl"
            >
              <ModalHeader backgroundColor="primary">Tambah Data Hero</ModalHeader>
              <ModalBody :onSubmit="handleAddHero">
                <div class="form-group">
                  <div class="row pt-3">
                    <div class="col-md-6 col-lg-4">
                      <div class="mb-3">
                        <label class="control-label">Nama</label>
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Nama"
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
                          <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="heroForm.durability"/>
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-6 col-md-4 col-lg-3">
                      <div class="mb-3">
                        <label class="control-label">Offense</label>
                        <div class="form-group">
                          <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="heroForm.offense"/>
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-6 col-md-4 col-lg-3">
                      <div class="mb-3">
                        <label class="control-label">Control Effect</label>
                        <div class="form-group">
                          <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="heroForm.control_effect"/>
                        </div>
                      </div>
                    </div>
                    <div class="col-sm-6 col-md-4 col-lg-3">
                      <div class="mb-3">
                        <label class="control-label">Difficulty</label>
                        <div class="form-group">
                          <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="heroForm.difficulty"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button
                    type="submit"
                    class="btn btn-success waves-effect"
                    :disabled="isSubmitting"
                  >
                    {{ isSubmitting ? 'Saving...' : 'Save' }}
                  </button>
                  <Button
                    type="button"
                    class="btn btn-primary waves-effect"
                    data-bs-dismiss="modal"
                    @click="resetForm"
                  >
                    Cancel
                  </Button>
                </div>
              </ModalBody>
            </Modal>
              
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
                    <td class="w-20">{{ hero.short_description }}</td>
                    <td>{{ new Date(hero.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</td>
                    <td class="w-20">
                      <div>
                        <ModalButton 
                          variant="secondary"
                          font="medium"
                          size="lg"
                          dataBsTarget="detail-hero"
                        >
                          Detail
                        </ModalButton>
                        <Modal id="detail-hero" size="xl">
                          <ModalHeader backgroundColor="primary">Detail Data Hero</ModalHeader>
                          <ModalBody>
                            <div class="row pt-3">
                              <div class="col-md-3">
                                <img :src="hero.image" alt="" class="img-fluid rounded mb-2" />
                              </div>
                              <div class="col-md-9 table-responsive">
                                <table class="table table-bordered table-hover">
                                  <tbody>
                                    <tr>
                                      <td>Name</td>
                                      <td>{{ hero.name }}</td>
                                    </tr>
                                    <tr>
                                      <td>Alias</td>
                                      <td>{{ hero.alias }}</td>
                                    </tr>
                                    <tr>
                                      <td>Release Date</td>
                                      <td>{{ new Date(hero.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</td>
                                    </tr>
                                    <tr>
                                      <td>Role</td>
                                      <td>
                                        <span
                                          v-for="(role, i) in Array.isArray(hero.role) ? hero.role : [hero.role]"
                                          :key="i"
                                          class="badge bg-danger me-1"
                                        > 
                                          {{ role }}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Type</td>
                                      <td>
                                        <span
                                          v-for="(type, i) in Array.isArray(hero.type) ? hero.type : [hero.type]"
                                          :key="i"
                                          class="badge bg-danger me-1"
                                        >
                                          {{ type }}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Short Description</td>
                                      <td>{{ hero.short_description }}</td>
                                    </tr>
                                  </tbody>
                                </table>
                                <div class="text-end">
                                  <Button
                                    type="button"
                                    class="btn btn-primary waves-effect"
                                    data-bs-dismiss="modal"
                                  >
                                  Cancel
                                </Button>
                              </div>
                              </div>
                            </div>
                            
                          </ModalBody>
                        </Modal>

                        <ModalButton
                          variant="warning"
                          dataBsTarget="edit-hero"
                          font="medium"
                          size="lg"
                          @click="openEditModal(hero)"
                        >
                          Edit
                        </ModalButton>
                        <Modal
                          id="edit-hero"
                          size="xl"
                        >
                          <ModalHeader backgroundColor="warning">Edit Data Hero</ModalHeader>
                          <ModalBody :onSubmit="handleEditHero">
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
                                    <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="editHero.durability"/>
                                  </div>
                                </div>
                              </div>
                              <div class="col-sm-6 col-md-4 col-lg-3">
                                <div class="mb-3">
                                  <label class="control-label">Offense</label>
                                  <div class="form-group">
                                    <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="editHero.offense"/>
                                  </div>
                                </div>
                              </div>
                              <div class="col-sm-6 col-md-4 col-lg-3">
                                <div class="mb-3">
                                  <label class="control-label">Control Effect</label>
                                  <div class="form-group">
                                    <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="editHero.control_effect"/>
                                  </div>
                                </div>
                              </div>
                              <div class="col-sm-6 col-md-4 col-lg-3">
                                <div class="mb-3">
                                  <label class="control-label">Difficulty</label>
                                  <div class="form-group">
                                    <input type="number" class="form-control" min="1" max="100" placeholder="Range 1 - 10" v-model="editHero.difficulty"/>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="modal-footer">
                              <button
                                type="submit"
                                class="btn btn-success waves-effect"
                                :disabled="isSubmitting"
                              >
                                {{ isSubmitting ? 'Saving...' : 'Save' }}
                              </button>
                              <Button
                                type="button"
                                class="btn btn-primary waves-effect"
                                data-bs-dismiss="modal"
                                @click="resetForm"
                              >
                                Cancel
                              </button>
                            </div>
                          </ModalBody>
                        </Modal>
                        <Button
                          variant="danger"
                          size="md"
                          class="me-1 m-t-10 mb-2 px-3 fs-3"
                          type="button"
                          @click="handleDeleteHero(hero._id)"
                        >
                          Hapus
                        </Button>
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
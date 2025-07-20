<script setup lang="ts">
import { ref, computed } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import Button from '../../components/Button/Button.vue';
import ModalButton from '../../components/Modal/ModalButton.vue';
import ModalHeader from '../../components/Modal/ModalHeader.vue';
import ModalBody from '../../components/Modal/ModalBody.vue';
import Modal from '../../components/Modal/Modal.vue';
import { useHeroes } from '../../lib/api/HeroApi';
import { useHeroService } from '../../lib/service/HeroService';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import FormInput from '../../components/FormInput/FormInput.vue';
import CheckboxGroup from '../../components/FormInput/CheckboxGroup.vue';
import Badge from '../../components/Badge/Badge.vue';
import FormTextarea from '../../components/FormInput/FormTextarea.vue';

const { result: heroResult, refetch } = useHeroes();
const heroes = computed(() => heroResult.value?.heroes || []);
const safeRefetch = async () => {
  const result = await refetch();
  return result ?? Promise.resolve();
};
const { handleAddHero, handleEditHero, handleDeleteHero } = useHeroService(safeRefetch);

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

function openEditModal(hero: any) {
  let formattedReleaseDate = hero.release_date;
  if (formattedReleaseDate && typeof formattedReleaseDate === 'string') {
    formattedReleaseDate = formattedReleaseDate.slice(0, 10);
  }
  editHero.value = { ...hero, release_date: formattedReleaseDate };
  editRoleEdit.value = Array.isArray(hero.role) ? [...hero.role] : hero.role ? [hero.role] : [];
  editTypeEdit.value = Array.isArray(hero.type) ? [...hero.type] : hero.type ? [hero.type] : [];
}

const isSubmitting = ref(false);

const onAddHero = async () => {
  isSubmitting.value = true;
  try {
    await handleAddHero(heroForm.value, editRole.value, editType.value);
    resetForm();
    editRole.value = [];
    editType.value = [];
  } finally {
    isSubmitting.value = false;
  }
};

const onEditHero = async () => {
  isSubmitting.value = true;
  try {
    await handleEditHero(editHero.value, editRoleEdit.value, editTypeEdit.value);
    resetForm();
    editRoleEdit.value = [];
    editTypeEdit.value = [];
  } finally {
    isSubmitting.value = false;
  }
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
              <ModalBody :onSubmit="onAddHero">
                <div class="form-group">
                  <div class="row pt-3">
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" label="Nama" v-model="heroForm.name" required />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" label="Alias" v-model="heroForm.alias" required />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="date" label="Tanggal Rilis" v-model="heroForm.release_date" required/>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 col-lg-4">
                      <CheckboxGroup
                        :options="roleOptions"
                        v-model="editRole"
                        label="Role"
                        :max="2"
                      />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <CheckboxGroup
                        :options="typeOptions"
                        v-model="editType"
                        label="Tipe"
                        :max="2"
                      />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormTextarea
                        label="Deskripsi Singkat"
                        v-model="heroForm.short_description"
                        :rows="5"
                        placeholder="Deskripsi Singkat Hero"
                        required
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6">
                      <FormInput type="text" label="Gambar" v-model="heroForm.image" required/>
                    </div>
                    <div class="col-md-6">
                      <FormInput type="text" label="Avatar" v-model="heroForm.avatar" required/>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm-6 col-md-4 col-lg-3">
                      <FormInput type="number" min="1" max="100" label="Durability" v-model="heroForm.durability" required/>
                    </div>
                    <div class="col-sm-6 col-md-4 col-lg-3">
                      <FormInput type="number" min="1" max="100" label="Offense" v-model="heroForm.offense" required/>
                    </div>
                    <div class="col-sm-6 col-md-4 col-lg-3">
                      <FormInput type="number" min="1" max="100" label="Control Effect" v-model="heroForm.control_effect" required/>
                    </div>
                    <div class="col-sm-6 col-md-4 col-lg-3">
                      <FormInput type="number" min="1" max="100" label="Difficulty" v-model="heroForm.difficulty" required/>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <Button type="submit"
                    class="btn btn-success waves-effect"
                    :disabled="isSubmitting"
                  >
                    {{ isSubmitting ? 'Saving...' : 'Save' }}
                  </Button>
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
                      <img :src="hero.avatar" style="width: 60%;" class="rounded-circle" alt="Avatar">
                    </td>
                    <td>{{ hero.alias }}</td>
                    <td>
                      <Badge
                        v-for="(role, i) in Array.isArray(hero.role) ? hero.role : [hero.role]"
                        :key="i"
                        color="warning"
                      >
                        {{ role }}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        v-for="(type, i) in Array.isArray(hero.type) ? hero.type : [hero.type]"
                        :key="i"
                        color="info"
                      >
                        {{ type }}
                      </Badge>
                    </td>
                    <td class="w-20">{{ hero.short_description }}</td>
                    <td>{{ new Date(hero.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</td>
                    <td class="w-20">
                      <div>
                        <ModalButton 
                          variant="secondary"
                          font="medium"
                          size="lg"
                          :dataBsTarget="'detail-hero-' + hero._id"
                        >
                          Detail 
                        </ModalButton>
                        <Modal :id="'detail-hero-' + hero._id" size="xl">
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
                                        <Badge
                                          v-for="(role, i) in Array.isArray(hero.role) ? hero.role : [hero.role]"
                                          :key="i"
                                          color="warning"
                                        >
                                          {{ role }}
                                        </Badge>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Type</td>
                                      <td>
                                        <Badge
                                          v-for="(type, i) in Array.isArray(hero.type) ? hero.type : [hero.type]"
                                          :key="i"
                                          color="info"
                                        >
                                          {{ type }}
                                        </Badge>
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
                          <ModalBody :onSubmit="onEditHero">
                            <h5>Data Hero</h5>
                            <div class="row pt-3">
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="text" label="Nama" v-model="editHero.name" required
                              />
                              </div>
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="text" label="Alias" v-model="editHero.alias" required />
                              </div>
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="date" label="Tanggal Rilis" v-model="editHero.release_date" required />
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-6 col-lg-4">
                                <CheckboxGroup
                                  :options="roleOptions"
                                  v-model="editRoleEdit"
                                  label="Role"
                                  :max="2"
                                />
                              </div>
                              <div class="col-md-6 col-lg-4">
                                <CheckboxGroup
                                  :options="typeOptions"
                                  v-model="editTypeEdit"
                                  label="Tipe"
                                  :max="2"
                                />
                              </div>
                              <div class="col-md-6 col-lg-4">
                                <FormTextarea
                                  label="Deskripsi Singkat"
                                  v-model="editHero.short_description"
                                  :rows="5"
                                  placeholder="Deskripsi Singkat Hero"
                                  required
                                />
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-6">
                                <FormInput type="text" label="Gambar" v-model="editHero.image" required />
                              </div>
                              <div class="col-md-6">
                                <FormInput type="text" label="Avatar" v-model="editHero.avatar" required />
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-sm-6 col-md-4 col-lg-3">
                                <FormInput type="number" label="Durability" v-model="editHero.durability" min="1" max="100" placeholder="Range 1 - 10"
                                />
                              </div>
                              <div class="col-sm-6 col-md-4 col-lg-3">
                                <FormInput type="number" label="Offense" v-model="editHero.offense" min="1" max="100" placeholder="Range 1 - 10" />
                              </div>
                              <div class="col-sm-6 col-md-4 col-lg-3">
                                <FormInput type="number" label="Control Effect" v-model="editHero.control_effect" min="1" max="100" placeholder="Range 1 - 10" />
                              </div>
                              <div class="col-sm-6 col-md-4 col-lg-3">
                                <FormInput type="number" label="Difficulty" v-model="editHero.difficulty" min="1" max="100" placeholder="Range 1 - 10" />
                              </div>
                            </div>
                            <div class="modal-footer">
                              <Button
                                type="submit"
                                class="btn btn-success waves-effect"
                                :disabled="isSubmitting"
                              >
                                {{ isSubmitting ? 'Saving...' : 'Save' }}
                              </Button>
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
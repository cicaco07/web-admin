<script setup lang="ts">
import { ref, computed } from 'vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import ModalButton from '../../components/Modal/ModalButton.vue';
import Modal from '../../components/Modal/Modal.vue';
import ModalHeader from '../../components/Modal/ModalHeader.vue';
import ModalBody from '../../components/Modal/ModalBody.vue';
import FormInput from '../../components/FormInput/FormInput.vue';
import Button from '../../components/Button/Button.vue';
import { useBattleSpell } from '../../lib/api/BattleSpellApi';
import { useBattleSpellService } from '../../lib/service/BattleSpellService';
import FormTextarea from '../../components/FormInput/FormTextarea.vue';
import Badge from '../../components/Badge/Badge.vue';

const { result: battleSpellResult, refetch } = useBattleSpell();
const battleSpells = computed(() => battleSpellResult.value?.battleSpells || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddBattleSpell, handleEditBattleSpell, handleDeleteBattleSpell } = useBattleSpellService(safeRefetch);

const defaultForm = (): {
  name: string,
  tag: string,
  icon: File | null,
  description: string,
  cooldown: number
} => ({
  name: '',
  tag: '',
  icon: null,
  description: '',
  cooldown: 0
});
const battleSpellForm = ref(defaultForm());
const isSubmitting = ref(false);
const originalIcon = ref<string>('');

const imagePreview = ref<string | null>(null);
const imageEditPreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const editFileInput = ref<HTMLInputElement | null>(null);

const resetForm = () => {
  battleSpellForm.value = defaultForm();
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  if (editFileInput.value) {
    editFileInput.value.value = '';
  }
  imagePreview.value = null;
  imageEditPreview.value = null;
};

function openEditModal(battleSpell: any) {
  battleSpellForm.value = { ...battleSpell };
  originalIcon.value = battleSpell.icon;
  imagePreview.value = null;
  if (editFileInput.value) {
    editFileInput.value.value = '';
  }
}

const onAddBattleSpell = async () => {
  isSubmitting.value = true;
  try {
    await handleAddBattleSpell(battleSpellForm.value);
    resetForm();
  } catch (error) {
    console.error('Error adding battle spell:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditBattleSpell = async () => {
  isSubmitting.value = true;
  try {
    await handleEditBattleSpell(battleSpellForm.value);
    resetForm();
  } catch (error) {
    console.error('Error editing battle spell:', error);
  } finally {
    isSubmitting.value = false;
  }
};

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    battleSpellForm.value.icon = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    battleSpellForm.value.icon = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      imageEditPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

function removeImage() {
  battleSpellForm.value.icon = null;
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function removeEditImage() {
  imageEditPreview.value = null;
  battleSpellForm.value.icon = null;
  if (editFileInput.value) {
    editFileInput.value.value = '';
  }
}

// Validate form before submit
function validateForm(): boolean {
  if (!battleSpellForm.value.name.trim()) {
    alert('Please enter battle spell name');
    return false;
  }
  if (!battleSpellForm.value.tag.trim()) {
    alert('Please enter battle spell tag');
    return false;
  }
  if (!battleSpellForm.value.description.trim()) {
    alert('Please enter battle spell description');
    return false;
  }
  if (battleSpellForm.value.cooldown < 0) {
    alert('Cooldown must be a positive number');
    return false;
  }
  if (!battleSpellForm.value.icon) {
    alert('Please select an icon');
    return false;
  }
  return true;
}

// Enhanced submit with validation
async function handleSubmitWithValidation() {
  if (!validateForm()) {
    return;
  }
  await onAddBattleSpell();
}
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Battle Spell"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Persiapan' },
        { name: 'Data Battle Spell', href: '/data-persiapan/data-battle-spell' },
      ]"
    />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Battle Spell</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <ModalButton
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-battle-spell"
              >
                Tambah Battle Spell
              </ModalButton>
            </div>
            <Modal id="add-battle-spell" size="xl">
              <ModalHeader backgroundColor="primary">Tambah Data Battle Spell</ModalHeader>
              <ModalBody @submit.prevent="onAddBattleSpell">
                <div class="form-group">
                  <div class="row pt-3">
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="battleSpellForm.name" label="Nama" required/> 
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="battleSpellForm.tag" label="Tag" required/> 
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="number" v-model="battleSpellForm.cooldown" label="Cooldown" required min="0" step="1" /> 
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-12">
                      <div class="mb-3">
                        <label for="icon" class="form-label">Icon <span class="text-danger">*</span></label>
                        <input
                          ref="fileInput"
                          type="file"
                          class="form-control"
                          id="icon"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          @change="handleFileChange"
                          required
                        />
                        <div class="form-text">
                          Upload an icon for the battle spell (JPEG, PNG, GIF, WebP) - Max size: 5MB
                        </div>
                        <div v-if="imagePreview">
                          <div class="my-3">
                            <label class="form-label">Image Preview</label>
                            <div class="d-flex align-items-center gap-3">
                              <img
                                :src="imagePreview"
                              alt="Icon preview"
                              class="img-thumbnail"
                              style="max-width: 100px; max-height: 100px; object-fit: cover; border: 2px solid #dee2e6;"
                              />
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                @click="removeImage"
                              >
                                <i class="ti ti-trash"></i> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-12">
                      <FormTextarea v-model="battleSpellForm.description" label="Deskripsi" required placeholder="Deskripsi Battle Spell" :rows="4"/>
                    </div>
                  </div>
                </div>
                <div class="modal-footer mt-3">
                  <Button type="submit"
                  class="btn-success waves-effect"
                  :disabled="isSubmitting"
                  :loading="isSubmitting"
                  >
                    Simpan
                  </Button>
                  <Button
                    type="button"
                    class="btn btn-primary waves-effect"
                    data-bs-dismiss="modal"
                    @click="resetForm"
                  >
                    Batal
                  </Button>
                </div>
              </ModalBody>
            </Modal>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr class="text-center">
                    <th>No</th>
                    <th>Name</th>
                    <th>Tag</th>
                    <th>Icon</th>
                    <th>Description</th>
                    <th>Cooldown</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(spell, index) in battleSpells" :key="spell.id" class="text-center align-items-center">
                    <td>{{ index + 1 }}</td>
                    <td>{{ spell.name }}</td>
                    <td>{{ spell.tag }}</td>
                    <td>
                      <img :src="`http://localhost:3000${spell.icon}`" alt="" class="rounded rounded-xl" style="width: 50px; height: 50px;" />
                    </td>
                    <td class="w-30">{{ spell.description }}</td>
                    <td>{{ spell.cooldown }}</td>
                    <td class="w-20">
                      <div class="">
                        <ModalButton 
                          variant="secondary"
                          font="medium"
                          size="lg"
                          :dataBsTarget="'detail-battle-spell-' + spell._id"
                        >
                          Detail 
                        </ModalButton>
                        <Modal :id="'detail-battle-spell-' + spell._id" size="xl">
                          <ModalHeader backgroundColor="secondary">
                            Detail Data Battle Spell {{ spell.name }}
                          </ModalHeader>
                          <ModalBody>
                            <div class="row pt-3">
                              <div class="col-md-4 text-center">
                                <img :src="`http://localhost:3000${spell.icon}`" alt="" class="rounded rounded-xl mb-3" style="width: 30%; height: auto;" />
                                <h4 class="text-center">{{ spell.name }}</h4>
                              </div>
                              <div class="col-md-8 items-center">
                                <div class="mb-4">
                                  <Badge color="info">{{ spell.tag }}</Badge>
                                </div>
                                <p>Cooldown: {{ spell.cooldown }} detik</p>
                                <div class="d-flex gap-2">
                                  <p>Description: </p>
                                  <p class="text-wrap">{{ spell.description }}</p>
                                </div>
                              </div>
                            </div>
                          </ModalBody>
                        </Modal>

                        <ModalButton
                          variant="warning"
                          dataBsTarget="edit-battle-spell"
                          font="medium"
                          size="lg"
                          @click="openEditModal(spell)"
                        >
                          Edit
                        </ModalButton>
                        <Modal id="edit-battle-spell" size="xl">
                          <ModalHeader backgroundColor="warning">Edit Data Battle Spell</ModalHeader>
                          <ModalBody @submit.prevent="onEditBattleSpell">
                            <div class="form-group">
                              <div class="row pt-3">
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="text" v-model="battleSpellForm.name" label="Nama" required/> 
                                </div>
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="text" v-model="battleSpellForm.tag" label="Tag" required/> 
                                </div>
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="number" v-model="battleSpellForm.cooldown" label="Cooldown" required min="0" step="1" /> 
                                </div>
                              </div>
                              <div class="row">
                                <div class="col-md-12">
                                  <div class="mb-3">
                                    <label for="icon-edit" class="form-label">Icon <span class="text-danger">*</span></label>
                                    <input
                                      ref="editFileInput"
                                      type="file"
                                      class="form-control"
                                      id="icon-edit"
                                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                      @change="handleEditFileChange"
                                      required
                                    />
                                    <div class="form-text">
                                      Upload an icon for the battle spell (JPEG, PNG, GIF, WebP) - Max size: 5MB
                                    </div>
                                    <div class="d-flex gap-4">
                                      <div>
                                        <div class="my-3">
                                          <label class="form-label">Current Image</label>
                                          <div class="d-flex align-items-center gap-3">
                                            <img
                                              :src="`http://localhost:3000${originalIcon}`"
                                              alt="Current icon"
                                              class="img-thumbnail"
                                              style="max-width: 100px; max-height: 100px; object-fit: cover; border: 2px solid #dee2e6;"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <!-- New Image Preview -->
                                      <div v-if="imageEditPreview">
                                        <div class="my-3">
                                          <label class="form-label">New Image Preview</label>
                                          <div class="d-flex align-items-center gap-3">
                                            <img
                                              :src="imageEditPreview"
                                              alt="New icon preview"
                                              class="img-thumbnail"
                                              style="max-width: 100px; max-height: 100px; object-fit: cover; border: 2px solid #28a745;"
                                            />
                                            <button
                                              type="button"
                                              class="btn btn-sm btn-outline-danger"
                                              @click="removeEditImage"
                                            >
                                              <i class="ti ti-trash"></i> Remove New
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-md-12">
                                  <FormTextarea v-model="battleSpellForm.description" label="Deskripsi" required placeholder="Deskripsi Battle Spell" :rows="4"/>
                                </div>
                              </div>
                            </div><div class="modal-footer mt-3">
                              <Button type="submit"
                              class="btn-success waves-effect"
                              :disabled="isSubmitting"
                              :loading="isSubmitting"
                              >
                                Simpan
                              </Button>
                              <Button
                                type="button"
                                class="btn btn-primary waves-effect"
                                data-bs-dismiss="modal"
                                @click="resetForm"
                              >
                                Batal
                              </Button>
                            </div>
                          </ModalBody>
                        </Modal>
                        <Button
                          variant="danger"
                          size="md"
                          class="me-1 m-t-10 mb-2 px-3 fs-3"
                          type="button"
                          @click="handleDeleteBattleSpell(spell._id)"
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

<style scoped>

.form-label {
  font-weight: 600;
  color: #495057;
}

.text-danger {
  color: #dc3545 !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.form-control:disabled {
  background-color: #f8f9fa;
  opacity: 0.65;
}

.btn.disabled {
  pointer-events: none;
  opacity: 0.65;
}
</style>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import { useEmblems } from '../../lib/api/EmblemApi';
import ModalButton from '../../components/Modal/ModalButton.vue';
import Modal from '../../components/Modal/Modal.vue';
import { useEmblemService } from '../../lib/service/EmblemService';
import ModalHeader from '../../components/Modal/ModalHeader.vue';
import ModalBody from '../../components/Modal/ModalBody.vue';
import FormInput from '../../components/FormInput/FormInput.vue';
import Button from '../../components/Button/Button.vue';

const { result: emblemResult, refetch } = useEmblems();
const emblems = computed(() => emblemResult.value?.emblems || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddEmblem, handleEditEmblem, handleDeleteEmblem } = useEmblemService(safeRefetch);

type Attribute = { [key: string]: number | string; icon: string };

const defaultForm = (): {
  name: string;
  type: string;
  icon: string;
  attributes: Attribute[];
  benefit: string;
  description: string;
  cooldown: string;
} => ({
  name: '',
  type: '',
  icon: '',
  attributes: [],
  benefit: '',
  description: '',
  cooldown: '',
});
const emblemForm = ref(defaultForm());

function openEditModal(emblem: any) {
  emblemForm.value = {
    ...emblem,
  }
}

const isSubmitting = ref(false);

const textFields = ref([{ id: Date.now(), key: '', value: '', icon: '' }]);
const addTextField = () =>
  textFields.value.push({ id: Date.now() + Math.random(), key: '', value: '', icon: '' });
const removeTextField = (i: number) => textFields.value.splice(i, 1);

const resetForm = () => {
  textFields.value = [{ id: Date.now(), key: '', value: '', icon: '' }];
  emblemForm.value = defaultForm();
};

const onAddEmblem = async () => {
  isSubmitting.value = true;
  try {
    emblemForm.value.attributes = textFields.value
      .filter(field => field.key.trim() && field.value.trim() && field.icon.trim())
      .map(field => ({
        [field.key]: parseFloat(field.value),
        icon: field.icon
      }));
    await handleAddEmblem(emblemForm.value);
    resetForm();
  } catch (error) {
    console.error('Error adding emblem:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditEmblem = async () => {
  isSubmitting.value = true;
  try {
    emblemForm.value.attributes = textFields.value
      .filter(field => field.key.trim() && field.value.trim() && field.icon.trim())
      .map(field => ({
        [field.key]: parseFloat(field.value),
        icon: field.icon
      }));
    await handleEditEmblem(emblemForm.value);
    resetForm();
  } catch (error) {
    console.error('Error editing emblem:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Emblems"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Persiapan', href: '/data-persiapan' },
        { name: 'Data Emblem', href: '/data-persiapan/data-emblem' }
      ]"
    />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Emblem</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <ModalButton
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-emblem"
              >
                Tambah Emblem
              </ModalButton>
            </div>
            <Modal id="add-emblem" size="xl">
              <ModalHeader backgroundColor="primary">Tambah Data Emblem</ModalHeader>
              <ModalBody :onSubmit="onAddEmblem">
                <div class="form-group">
                  <div class="row pt-3">
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="emblemForm.name" label="Nama Emblem" required />
                    </div>
                    <div class="col-md-6 col-lg-4 mb-3">
                      <label for="">Tipe</label>
                      <select class="form-select" v-model="emblemForm.type" required>
                        <option value="" disabled selected>Pilih Tipe</option>
                        <option value="Main Emblem">Main Emblem</option>
                        <option value="Common Talent - Section 1">Common Talent - Section 1</option>
                        <option value="Common Talent - Section 2">Common Talent - Section 2</option>
                        <option value="Primary Talent">Primary Talent</option>
                      </select>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="emblemForm.icon" label="Ikon" required />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="emblemForm.benefit" label="Benefit"/>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="emblemForm.description" label="Deskripsi"/>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="emblemForm.cooldown" label="Cooldown"/>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-8 col-lg-6">
                      <label>Attribut</label>
                        <div
                          v-for="(field, idx) in textFields"
                          :key="field.id"
                          class="d-flex align-items-center mb-3"
                          style="width: 100%;"
                        >
                          <input
                            type="text"
                            class="form-control me-2"
                            v-model="field.key"
                            placeholder="Nama Attribut (contoh: hp, hp_regen, hybrid_defense, icon)"
                            style="flex: 1 1 auto;"
                            required
                          />
                          <input
                            type="text"
                            class="form-control me-2"
                            v-model="field.value"
                            placeholder="Nilai (contoh: 500, 4, 10, https://...)"
                            style="flex: 1 1 auto;"
                            required
                          />
                          <button
                            v-if="idx === 0"
                            @click.prevent="addTextField"
                            class="btn btn-success"
                            type="button"
                            style="flex-shrink: 0;"
                          >
                            <i class="ti ti-circle-plus fs-5"></i>
                          </button>
                          <button
                            v-else
                            @click.prevent="removeTextField(idx)"
                            class="btn btn-danger"
                            type="button"
                            style="flex-shrink: 0;"
                          >
                            <i class="ti ti-minus fs-5"></i>
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <Button
                    type="submit"
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
                    <th>Icon</th>
                    <th>Nama Emblem</th>
                    <th>Tipe</th>
                    <th>Benefit</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(emblem, index) in emblems" :key="emblem.id" class="text-center align-items-center">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <img :src="emblem.icon" alt="" class="img-fluid" style="width: 50px; height: 50px;">
                    </td>
                    <td>{{ emblem.name }}</td>
                    <td>{{ emblem.type }}</td>
                    <td>{{ emblem.benefit }}</td>
                    <td>
                      <ModalButton 
                        variant="secondary"
                        font="medium"
                        size="lg"
                        :dataBsTarget="'detail-emblem-' + emblem._id"
                      >
                        Detail 
                      </ModalButton>
                      <Modal :id="'detail-emblem-' + emblem._id" size="xl">
                          <ModalHeader backgroundColor="primary">Detail Data Emblem</ModalHeader>
                          <ModalBody>
                            <p><strong>Nama:</strong> {{ emblem.name }}</p>
                            <p><strong>Tipe:</strong> {{ emblem.type }}</p>
                            <img :src="emblem.icon" alt="">
                            <p><strong>Benefit:</strong> {{ emblem.benefit }}</p>
                            <p><strong>Attribute:</strong> {{ emblem.attribute }}</p>
                            <p><strong>Deskripsi:</strong> {{ emblem.description }}</p>
                            <p><strong>Cooldown:</strong> {{ emblem.cooldown }}</p>
                          </ModalBody>
                      </Modal>
                      <ModalButton
                        variant="warning"
                        font="medium"
                        size="lg"
                        dataBsTarget="edit-emblem"
                        @click="openEditModal(emblem)"
                      >
                        Edit
                      </ModalButton>
                      <Modal id="edit-emblem" size="xl">
                        <ModalHeader backgroundColor="warning">Edit Data Emblem</ModalHeader>
                        <ModalBody :onSubmit="onEditEmblem">
                          <div class="form-group">
                            <div class="row pt-3">
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="text" v-model="emblemForm.name" label="Nama Emblem" required />
                              </div>
                              <div class="col-md-6 col-lg-4 mb-3">
                                <label for="">Tipe</label>
                                <select class="form-select" v-model="emblemForm.type" required>
                                  <option value="" disabled selected>Pilih Tipe</option>
                                  <option value="Main Emblem">Main Emblem</option>
                                  <option value="Common Talent - Section 1">Common Talent - Section 1</option>
                                  <option value="Common Talent - Section 2">Common Talent - Section 2</option>
                                  <option value="Primary Talent">Primary Talent</option>
                                </select>
                              </div>
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="text" v-model="emblemForm.icon" label="Ikon" required />
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="text" v-model="emblemForm.benefit" label="Benefit"/>
                              </div>
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="text" v-model="emblemForm.description" label="Deskripsi"/>
                              </div>
                              <div class="col-md-6 col-lg-4">
                                <FormInput type="text" v-model="emblemForm.cooldown" label="Cooldown"/>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-md-8 col-lg-6">
                                <label>Attribut</label>
                                  <div
                                    v-for="(field, idx) in textFields"
                                    :key="'edit-' + field.id"
                                    class="d-flex align-items-center mb-3"
                                    style="width: 100%;"
                                  >
                                    <input
                                      type="text"
                                      class="form-control me-2"
                                      v-model="field.key"
                                      placeholder="Nama Attribut (contoh: hp, hp_regen, hybrid_defense, icon)"
                                      style="flex: 1 1 auto;"
                                      required
                                    />
                                    <input
                                      type="text"
                                      class="form-control me-2"
                                      v-model="field.value"
                                      placeholder="Nilai (contoh: 500, 4, 10, https://...)"
                                      style="flex: 1 1 auto;"
                                      required
                                    />
                                    <button
                                      v-if="idx === 0"
                                      @click.prevent="addTextField"
                                      class="btn btn-success"
                                      type="button"
                                      style="flex-shrink: 0;"
                                    >
                                      <i class="ti ti-circle-plus fs-5"></i>
                                    </button>
                                    <button
                                      v-else
                                      @click.prevent="removeTextField(idx)"
                                      class="btn btn-danger"
                                      type="button"
                                      style="flex-shrink: 0;"
                                    >
                                      <i class="ti ti-minus fs-5"></i>
                                    </button>
                                  </div>
                              </div>
                            </div>
                          </div>
                          <div class="modal-footer">
                            <Button
                              type="submit"
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
                      <Button variant="danger" size="md" class="me-1 m-t-10 mb-2 px-3 fs-3" type="button" @click="handleDeleteEmblem(emblem._id)"
                      >
                        Hapus
                      </Button>
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
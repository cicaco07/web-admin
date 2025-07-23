<script setup lang="ts">
import { computed, ref } from 'vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import Modal from '../../components/Modal/Modal.vue';
import ModalBody from '../../components/Modal/ModalBody.vue';
import ModalButton from '../../components/Modal/ModalButton.vue';
import ModalHeader from '../../components/Modal/ModalHeader.vue';
import { useItemService } from '../../lib/service/ItemService';
import { useItems } from '../../lib/api/ItemApi';
import FormInput from '../../components/FormInput/FormInput.vue';
import FormTextarea from '../../components/FormInput/FormTextarea.vue';
import Button from '../../components/Button/Button.vue';
import Badge from '../../components/Badge/Badge.vue';

const { result: itemResult, refetch } = useItems();
const items = computed(() => itemResult.value?.items || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddItem } = useItemService(safeRefetch);

const defaultForm = (): {
  name: string;
  type: string;
  tag: string;
  attributes: string[];
  price: string;
  image: string;
  story: string;
  description: string[];
  tips: string;
  parent_items: any[];
} => ({
  name: '',
  type: '',
  tag: '',
  attributes: [],
  price: '',
  image: '',
  story: '',
  description: [],
  tips: '',
  parent_items: [],
});
const itemForm = ref(defaultForm());

const isSubmitting = ref(false);

const textFields = ref([{ id: Date.now(), value: '' }]);
const textareaFields = ref([{ id: Date.now() + 1, textarea: '' }]);

const resetForm = () => {
  itemForm.value = defaultForm();
  textFields.value = [{ id: Date.now(), value: '' }];
  textareaFields.value = [{ id: Date.now() + 1, textarea: '' }];
};

const onAddItem = async () => {
  isSubmitting.value = true;
  try {
    itemForm.value.description = textareaFields.value.map(f => f.textarea).filter(Boolean);
    itemForm.value.attributes = textFields.value.map(f => f.value).filter(Boolean);
    await handleAddItem(itemForm.value);
    resetForm();
  } finally {
    isSubmitting.value = false;
  }
};

const addTextField = () => textFields.value.push({ id: Date.now() + Math.random(), value: '' });
const removeTextField = (i: number) => textFields.value.splice(i, 1);
const addTextareaField = () => textareaFields.value.push({ id: Date.now() + Math.random(), textarea: '' });
const removeTextareaField = (i: number) => textareaFields.value.splice(i, 1);
</script>

<template>
  <DashboardLayout>
    <Breadcrumb
      title="Data Item"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Persiapan', href: '/data-persiapan' },
        { name: 'Data Item', href: '/data-persiapan/data-item' }
      ]"
    />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Item</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <ModalButton
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-item"
              >
                Tambah Item
              </ModalButton>
            </div>
            <Modal id="add-item" size="xl">
              <ModalHeader backgroundColor="primary">Tambah Data Skill</ModalHeader>
              <ModalBody :onSubmit="onAddItem">
                <div class="form-group">
                  <div class="row pt-3">
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="itemForm.name" label="Nama Item" required />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="itemForm.tag" label="Tag Item" required />
                    </div>
                    <div class="col-md-6 col-lg-4 mb-3">
                      <label for="">Tipe</label>
                      <select class="form-select" v-model="itemForm.type" required>
                        <option value="" disabled selected>Pilih Tipe</option>
                        <option value="Attack">Attack</option>
                        <option value="Magic">Magic</option>
                        <option value="Defense">Defense</option>
                        <option value="Movement">Movement</option>
                        <option value="Jungle">Jungle</option>
                        <option value="Roaming">Roaming</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="number" v-model="itemForm.price" :min="1" label="Harga" required />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="itemForm.image" label="Gambar" required />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormTextarea
                        v-model="itemForm.tips"
                        label="Tips"
                        :rows="3"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 col-lg-4">
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
                          v-model="field.value"
                          placeholder="Masukkan Attribut"
                          style="flex: 1 1 auto;"
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
                    <div class="col-md-6 col-lg-4">
                      <label>Deskripsi</label>
                      <div
                        v-for="(field, idx) in textareaFields"
                        :key="field.id"
                        class="d-flex align-items-center mb-3 w-full"
                      >
                        <textarea
                          class="form-control me-2"
                          rows="3"
                          placeholder="Masukkan Deskripsi"
                          v-model="field.textarea"
                          style="flex: 1 1 auto;"
                        ></textarea>
                        <button
                          v-if="idx === 0"
                          @click.prevent="addTextareaField"
                          class="btn btn-success"
                          type="button"
                          style="flex-shrink: 0;"
                        >
                          <i class="ti ti-circle-plus fs-5"></i>
                        </button>
                        <button
                          v-else
                          @click.prevent="removeTextareaField(idx)"
                          class="btn btn-danger"
                          type="button"
                          style="flex-shrink: 0;"
                        >
                          <i class="ti ti-minus fs-5"></i>
                        </button>
                      </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormTextarea v-model="itemForm.story" label="Cerita" :rows="3" />
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
                    <th>Gambar</th>
                    <th>Tag</th>
                    <th>Tipe</th>
                    <th>Atribut</th>
                    <th>Harga</th>
                    <th>Tips</th>
                    <td>Aksi</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="item.id" class="text-center align-items-center">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                    <td>
                      <img :src="item.image" alt="" class="img-fluid" />
                    </td>
                    <td>{{ item.tag }}</td>
                    <td>{{ item.type }}</td>
                    <td>{{ item.attributes.join(', ') }}</td>
                    <td>{{ item.price }}</td>
                    <td>{{ item.tips }}</td>
                    <td class="w-20">
                      <ModalButton
                        variant="secondary"
                        font="medium"
                        size="lg"
                        :dataBsTarget="'detail-item-' + item._id"
                      >
                        Detail
                      </ModalButton>
                      <Modal :id="'detail-item-' + item._id" size="xl">
                        <ModalHeader :backgroundColor="'primary'">Detail Item {{ item.name }}</ModalHeader>
                        <ModalBody>
                          <div class="row">
                            <div class="col-md-6 col-lg-4 d-flex align-items-center">
                              <div class="row">
                                <div class="col-md-6 d-flex justify-content-center">
                                  <div class="d-flex flex-column">
                                    <img :src="item.image" alt="" class="img-fluid mb-3" />
                                    <Badge
                                      v-if="item.price"
                                      color="warning"
                                      class="mb-2"
                                    >
                                      {{ item.price }}
                                    </Badge>
                                  </div>
                                </div>
                                <div class="col-md-6">
                                  <Badge
                                    v-if="item.type"
                                    :color="item.type === 'Attack' ? 'danger' : item.type === 'Magic' ? 'info' : item.type === 'Defense' ? 'success' : item.type === 'Movement' ? 'primary' : item.type === 'Jungle' ? 'warning' : 'secondary'"
                                    class="mb-2"
                                  >
                                    {{ item.type }}
                                  </Badge>
                                  <h5 class="mb-1">{{ item.name }}</h5>
                                  <p class="text-muted">{{ item.tag }}</p>
                                </div>
                              </div>
                              
                            </div>
                            <div class="col-md-6 col-lg-8">
                              <h5>Cerita</h5>
                              <p>{{ item.story }}</p>
                              <hr>
                              <div class="row">
                                <div class="col-4">
                                  <h5>Attribut</h5>
                                  <ul class="list-unstyled">
                                    <li v-for="(attr, idx) in item.attributes" :key="idx">{{ attr }}</li>
                                  </ul>
                                </div>
                                <div class="col-8">
                                  <h5>Deskripsi</h5>
                                  <ul class="list-unstyled">
                                    <li v-for="(desc, idx) in item.description" :key="idx">{{ desc }}</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ModalBody>
                      </Modal>
                      <ModalButton
                        variant="warning"
                        font="medium"
                        size="lg"
                        dataBsTarget="edit-item"
                      >
                        Edit
                      </ModalButton>
                      <Button
                        variant="danger"
                        size="md"
                        class="me-1 m-t-10 mb-2 px-3 fs-3"
                        type="button"
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
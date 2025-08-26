<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import ModalButton from '../../components/Modal/ModalButton.vue';
import { useGetNavigationTree } from '../../lib/api/NavigationApi';
import Modal from '../../components/Modal/Modal.vue';
import ModalHeader from '../../components/Modal/ModalHeader.vue';
import ModalBody from '../../components/Modal/ModalBody.vue';
import FormInput from '../../components/FormInput/FormInput.vue';
import CheckboxGroup from '../../components/FormInput/CheckboxGroup.vue';
import { useNavigationService } from '../../lib/service/NavigationService';
import Button from '../../components/Button/Button.vue';

const token = localStorage.getItem('token') ?? '';
if (!token) {
  console.error('No token found in localStorage');
}
const { result: navigationResult, refetch } = useGetNavigationTree(token);
const navigationsRaw = computed(() => navigationResult.value?.getNavigationTree || []);
const safeRefetch = async () => {
  const result = await refetch();
  return result ?? Promise.resolve();
};
const { handleAddNavigation, handleEditNavigation, handleDeleteNavigation } = useNavigationService(safeRefetch);

function flattenNavigations(navigations: any[]) {
  const flattened: any[] = [];
  
  navigations.forEach(navigation => {
    // Tambahkan parent menu
    flattened.push({
      ...navigation,
      level: 0,
      isParent: true,
      hasChildren: navigation.children && navigation.children.length > 0
    });
    
    // Tambahkan children jika ada
    if (navigation.children && navigation.children.length > 0) {
      navigation.children.forEach((child: any) => {
        flattened.push({
          ...child,
          level: 1,
          isParent: false,
          hasChildren: false,
          parentName: navigation.name
        });
      });
    }
  });
  
  return flattened;
}
const navigations = computed(() => flattenNavigations(navigationsRaw.value));

// Computed untuk mendapatkan hanya parent menu untuk dropdown
const parentMenuOptions = computed(() => {
  return navigationsRaw.value
    .filter((nav: any) => nav.is_header === true)
    .map((nav: any) => ({
      _id: nav._id,
      name: nav.name
    }));
});

const defaultForm = {
  _id: '',
  name: '',
  route: '',
  icon: '',
  parent_id: null,
  roles: [],
  order: 0,
  is_header: false,
  component: '',
  level: 0
};
const navigationForm = ref({ ...defaultForm });
const editNavigationForm = ref({ ...defaultForm });
const editRole = ref<string[]>([]);
const editRoleEdit = ref<string[]>([]);
const roleOptions = ['super_admin', 'member', 'user'];
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);
const orderError = ref('');
const editOrderError = ref('');

const resetForm = () => {
  navigationForm.value = { ...defaultForm };
  editRole.value = [];
  orderError.value = '';
};

const resetEditForm = () => {
  editNavigationForm.value = { ...defaultForm };
  editRoleEdit.value = [];
  editOrderError.value = '';
};

// Handler untuk mengatur is_header berdasarkan parent - ADD FORM
watch(() => navigationForm.value.parent_id, (newParentId) => {
  if (newParentId) {
    navigationForm.value.is_header = false;
    navigationForm.value.level = 1;
  } else {
    navigationForm.value.level = 0;
  }
});

// Handler untuk mengatur is_header berdasarkan parent - EDIT FORM
watch(() => editNavigationForm.value.parent_id, (newParentId) => {
  if (newParentId) {
    editNavigationForm.value.is_header = false;
    editNavigationForm.value.level = 1;
  } else {
    editNavigationForm.value.level = 0;
  }
});

// Computed untuk menentukan apakah is_header bisa diubah
const canChangeIsHeader = computed(() => {
  return !navigationForm.value.parent_id;
});

const canChangeIsHeaderEdit = computed(() => {
  return !editNavigationForm.value.parent_id;
});

// Handler untuk validasi order
const validateOrder = () => {
  const currentOrder = Number(navigationForm.value.order);
  const parentId = navigationForm.value.parent_id;
  
  // Reset error
  orderError.value = '';
  
  if (currentOrder <= 0) {
    orderError.value = 'Urutan harus lebih dari 0';
    return false;
  }

  let existingOrders: number[] = [];
  
  if (parentId) {
    const parentNav = navigationsRaw.value.find((nav: any) => nav._id === parentId);
    if (parentNav && parentNav.children) {
      existingOrders = parentNav.children.map((child: any) => child.order);
    }
  } else {
    existingOrders = navigationsRaw.value.map((nav: any) => nav.order);
  }
  
  if (existingOrders.includes(currentOrder)) {
    orderError.value = 'Urutan yang anda pilih sudah dipakai';
    return false;
  }
  
  return true;
};

const validateEditOrder = () => {
  const currentOrder = Number(editNavigationForm.value.order);
  const parentId = editNavigationForm.value.parent_id;
  const currentId = editNavigationForm.value._id;
  
  editOrderError.value = '';
  
  if (currentOrder <= 0) {
    editOrderError.value = 'Urutan harus lebih dari 0';
    return false;
  }
  
  let existingOrders: number[] = [];
  
  if (parentId) {
    const parentNav = navigationsRaw.value.find((nav: any) => nav._id === parentId);
    if (parentNav && parentNav.children) {
      existingOrders = parentNav.children
        .filter((child: any) => child._id !== currentId) // Exclude current item
        .map((child: any) => child.order);
    }
  } else {
    existingOrders = navigationsRaw.value
      .filter((nav: any) => nav._id !== currentId) // Exclude current item
      .map((nav: any) => nav.order);
  }
  
  if (existingOrders.includes(currentOrder)) {
    editOrderError.value = 'Urutan yang anda pilih sudah dipakai';
    return false;
  }
  
  return true;
};

// Watch order untuk validasi real-time
watch(() => navigationForm.value.order, () => {
  if (navigationForm.value.order) {
    validateOrder();
  }
});

watch(() => editNavigationForm.value.order, () => {
  if (editNavigationForm.value.order) {
    validateEditOrder();
  }
});

const openEditModal = (navigation: any) => {
  editNavigationForm.value = {
    _id: navigation._id,
    name: navigation.name,
    route: navigation.route || '',
    icon: navigation.icon || '',
    parent_id: navigation.parent_id || null,
    roles: navigation.roles || [],
    order: navigation.order,
    is_header: navigation.is_header,
    component: navigation.component || '',
    level: navigation.level
  };
  
  // Set roles untuk checkbox
  editRoleEdit.value = Array.isArray(navigation.roles) ? [...navigation.roles] : [];
  
  // Reset error
  editOrderError.value = '';
};

const onAddNavigation = async () => {
  // Validasi order sebelum submit
  if (!validateOrder()) {
    return;
  }
  
  isSubmitting.value = true;
  try {
    await handleAddNavigation(navigationForm.value, editRole.value);
    resetForm();
    editRole.value = [];
  } catch (error) {
    console.error('Error menambahkan navigasi:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditNavigation = async () => {
  if (!validateEditOrder()) {
    return;
  }
  
  isEditSubmitting.value = true;
  try {
    await handleEditNavigation(editNavigationForm.value, editRoleEdit.value);
    resetEditForm();
  } catch (error) {
    console.error('Error mengupdate navigasi:', error);
  } finally {
    isEditSubmitting.value = false;
  }
};

onMounted(() => {
  refetch();
});
</script>

<template>
  <DashboardLayout>
    <Breadcrumb 
      title="Data Navigasi"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Data Navigasi', href: '/navigasi' }
      ]"
    />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Navigasi</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <ModalButton
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-navigation"
              >
                Tambah Navigasi
              </ModalButton>
            </div>
            <Modal id="add-navigation" size="xl">
              <ModalHeader backgroundColor="primary">Tambah Data Navigasi</ModalHeader>
              <ModalBody :onSubmit="onAddNavigation">
                <div class="form-group">
                  <div class="row pt-3">
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="navigationForm.name" label="Nama" required/>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="navigationForm.route" label="Route"/>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="navigationForm.icon" label="Icon"/>
                    </div>
                    
                    <!-- Parent Selection -->
                    <div class="col-md-6 col-lg-4">
                      <label for="parent_id" class="control-label">Parent</label>
                      <select v-model="navigationForm.parent_id" class="form-select">
                        <option value="">Tidak ada (Parent Menu)</option>
                        <option v-for="nav in parentMenuOptions" :key="nav._id" :value="nav._id">
                          {{ nav.name }}
                        </option>
                      </select>
                      <small class="text-muted">
                        Pilih parent untuk membuat submenu
                      </small>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <CheckboxGroup
                        :options="roleOptions"
                        v-model="editRole"
                        label="Role"
                        :max="3"
                      />
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput 
                        type="number" 
                        v-model="navigationForm.order" 
                        label="Urutan" 
                        required
                        :class="{ 'is-invalid': orderError }"
                      />
                      <div v-if="orderError" class="invalid-feedback d-block">
                        {{ orderError }}
                      </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <label for="is_header" class="control-label">
                        Tipe Menu
                        <span v-if="!canChangeIsHeader" class="text-muted">(Otomatis)</span>
                      </label>
                      <select 
                        v-model="navigationForm.is_header" 
                        class="form-select" 
                        required
                        :disabled="!canChangeIsHeader"
                      >
                        <option :value="true">Header</option>
                        <option :value="false">Submenu</option>
                      </select>
                      <small v-if="!canChangeIsHeader" class="text-muted">
                        Karena memiliki parent, otomatis menjadi submenu
                      </small>
                      <small v-else class="text-muted">
                        Header = Menu utama, Submenu = Menu child
                      </small>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="text" v-model="navigationForm.component" label="Component" required/>
                    </div>
                    <div class="col-md-6 col-lg-4">
                      <FormInput type="number" v-model="navigationForm.level" label="Level" required/>
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
                    <th>Nama</th>
                    <th>Tipe</th>
                    <th>Route</th>
                    <th>Icon</th>
                    <th>Parent</th>
                    <th>Role</th>
                    <th>Urutan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(navigation, index) in navigations" 
                    :key="navigation._id" 
                    class="text-center align-middle"
                    :class="{
                      'bg-light': navigation.isParent,
                      'border-start border-2 border-primary': navigation.level === 1
                    }"
                  >
                    <td>{{ index + 1 }}</td>
                    
                    <!-- Nama dengan indentasi untuk children -->
                    <td class="text-start">
                      <div :style="{ paddingLeft: navigation.level * 20 + 'px' }">
                        <span v-if="navigation.level === 1" class="text-muted me-2">├─</span>
                        <strong v-if="navigation.isParent">{{ navigation.name }}</strong>
                        <span v-else>{{ navigation.name }}</span>
                        <small v-if="navigation.hasChildren" class="text-muted ms-2">
                          ({{ navigation.children?.length }} children)
                        </small>
                      </div>
                    </td>
                    
                    <!-- Tipe -->
                    <td>
                      <span 
                        :class="{
                          'badge bg-primary': navigation.is_header,
                          'badge bg-secondary': !navigation.is_header
                        }"
                      >
                        {{ navigation.is_header ? 'Header' : 'Submenu' }}
                      </span>
                    </td>
                    
                    <!-- Route -->
                    <td class="text-start">
                      <code v-if="navigation.route">{{ navigation.route }}</code>
                      <span v-else class="text-muted">-</span>
                    </td>
                    
                    <!-- Icon -->
                    <td>
                      <i v-if="navigation.icon" :class="navigation.icon" class="fs-5"></i>
                      <span v-else class="text-muted">-</span>
                    </td>
                    
                    <!-- Parent -->
                    <td>
                      <span v-if="navigation.parentName" class="text-muted">
                        {{ navigation.parentName }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    
                    <!-- Role -->
                    <td>
                      <span v-if="navigation.roles && navigation.roles.length > 0">
                        {{ Array.isArray(navigation.roles) ? navigation.roles.join(', ') : navigation.roles }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    
                    <!-- Urutan -->
                    <td>
                      <span class="badge bg-info">{{ navigation.order }}</span>
                    </td>
                    
                    <!-- Aksi -->
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          dataBsTarget="edit-navigation"
                          @click="openEditModal(navigation)"
                        >
                          <i class="ti ti-edit"></i>
                          <span class="mx-1">Edit</span>
                        </ModalButton>
                        <Modal id="edit-navigation" size="xl">
                          <ModalHeader backgroundColor="warning">Edit Data Navigasi</ModalHeader>
                          <ModalBody :onSubmit="onEditNavigation">
                            <div class="form-group">
                              <div class="row pt-3">
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="text" v-model="editNavigationForm.name" label="Nama" required/>
                                </div>
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="text" v-model="editNavigationForm.route" label="Route"/>
                                </div>
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="text" v-model="editNavigationForm.icon" label="Icon"/>
                                </div>
                                
                                <div class="col-md-6 col-lg-4">
                                  <label for="edit_parent_id" class="control-label">Parent</label>
                                  <select v-model="editNavigationForm.parent_id" class="form-select">
                                    <option value="">Tidak ada (Parent Menu)</option>
                                    <option 
                                      v-for="nav in parentMenuOptions" 
                                      :key="nav._id" 
                                      :value="nav._id"
                                      :disabled="nav._id === editNavigationForm._id"
                                    >
                                      {{ nav.name }}
                                    </option>
                                  </select>
                                  <small class="text-muted">
                                    Pilih parent untuk membuat submenu
                                  </small>
                                </div>
                                
                                <div class="col-md-6 col-lg-4">
                                  <CheckboxGroup
                                    :options="roleOptions"
                                    v-model="editRoleEdit"
                                    label="Role"
                                    :max="3"
                                  />
                                </div>
                                
                                <div class="col-md-6 col-lg-4">
                                  <FormInput 
                                    type="number" 
                                    v-model="editNavigationForm.order" 
                                    label="Urutan" 
                                    required
                                    :class="{ 'is-invalid': editOrderError }"
                                  />
                                  <div v-if="editOrderError" class="invalid-feedback d-block">
                                    {{ editOrderError }}
                                  </div>
                                </div>
                                
                                <div class="col-md-6 col-lg-4">
                                  <label for="edit_is_header" class="control-label">
                                    Tipe Menu
                                    <span v-if="!canChangeIsHeaderEdit" class="text-muted">(Otomatis)</span>
                                  </label>
                                  <select 
                                    v-model="editNavigationForm.is_header" 
                                    class="form-select" 
                                    required
                                    :disabled="!canChangeIsHeaderEdit"
                                  >
                                    <option :value="true">Header</option>
                                    <option :value="false">Submenu</option>
                                  </select>
                                  <small v-if="!canChangeIsHeaderEdit" class="text-muted">
                                    Karena memiliki parent, otomatis menjadi submenu
                                  </small>
                                  <small v-else class="text-muted">
                                    Header = Menu utama, Submenu = Menu child
                                  </small>
                                </div>
                                
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="text" v-model="editNavigationForm.component" label="Component" required/>
                                </div>
                                
                                <div class="col-md-6 col-lg-4">
                                  <FormInput type="number" v-model="editNavigationForm.level" label="Level" required readonly/>
                                </div>
                              </div>
                            </div>
                            <div class="modal-footer">
                              <Button
                                type="submit"
                                class="btn-warning waves-effect"
                                :disabled="isEditSubmitting || !!editOrderError"
                                :loading="isEditSubmitting"
                              >
                                Update
                              </Button>
                              <Button
                                type="button"
                                class="btn btn-secondary waves-effect"
                                data-bs-dismiss="modal"
                                @click="resetEditForm"
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
                          @click="handleDeleteNavigation(navigation._id)"
                        >
                          <i class="ti ti-trash"></i>
                          <span class="mx-1">Hapus</span>
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
.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}

.table tbody tr.bg-light {
  background-color: #f8f9fa !important;
}

.table tbody tr.border-start {
  border-left-color: var(--bs-primary) !important;
  border-left-width: 3px !important;
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.1) !important;
}

.badge {
  font-size: 0.75rem;
}

code {
  font-size: 0.875rem;
  color: #e83e8c;
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}
</style>
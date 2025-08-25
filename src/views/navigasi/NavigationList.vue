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
const { handleAddNavigation } = useNavigationService(safeRefetch);

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

const resetForm = () => {
  navigationForm.value = { ...defaultForm };
  editRole.value = [];
  orderError.value = '';
};

const editRole = ref<string[]>([]);
const roleOptions = ['super_admin', 'member', 'user'];
const isSubmitting = ref(false);
const orderError = ref('');

// Handler untuk mengatur is_header berdasarkan parent
watch(() => navigationForm.value.parent_id, (newParentId) => {
  if (newParentId) {
    // Jika ada parent, paksa is_header menjadi false
    navigationForm.value.is_header = false;
    navigationForm.value.level = 1; // Set level menjadi 1 untuk submenu
  } else {
    // Jika tidak ada parent, reset ke default
    navigationForm.value.level = 0; // Set level menjadi 0 untuk parent menu
  }
});

// Computed untuk menentukan apakah is_header bisa diubah
const canChangeIsHeader = computed(() => {
  return !navigationForm.value.parent_id;
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
  
  // Cek duplikasi order berdasarkan level yang sama
  let existingOrders: number[] = [];
  
  if (parentId) {
    // Jika ada parent, cek order di dalam children dari parent yang sama
    const parentNav = navigationsRaw.value.find((nav: any) => nav._id === parentId);
    if (parentNav && parentNav.children) {
      existingOrders = parentNav.children.map((child: any) => child.order);
    }
  } else {
    // Jika tidak ada parent, cek order di level parent (top level)
    existingOrders = navigationsRaw.value.map((nav: any) => nav.order);
  }
  
  if (existingOrders.includes(currentOrder)) {
    orderError.value = 'Urutan yang anda pilih sudah dipakai';
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
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>
                        <ModalButton
                          variant="danger"
                          font="medium"
                          size="sm"
                          dataBsTarget="delete-navigation"
                        >
                          <i class="ti ti-trash"></i>
                        </ModalButton>
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
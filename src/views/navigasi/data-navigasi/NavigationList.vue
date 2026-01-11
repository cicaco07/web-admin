<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

// Layout & Components
import DashboardLayout from '../../../components/DashboardLayout.vue';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../../components/Button/Button.vue';
import ModalButton from '../../../components/Modal/ModalButton.vue';
import TablePagination from '../../../components/Table/TablePagination.vue';

// Navigation Components
import NavigationFormModal from './components/NavigationFormModal.vue';

// API & Services
import { useGetNavigationTree } from '../../../lib/api/NavigationApi';
import { useNavigationService } from '../../../lib/service/NavigationService';

// Types
import type { Navigation, NavigationFormData } from '../../../types/Navigation';
import { createDefaultNavigationForm } from '../../../types/Navigation';

// ==================== Authentication ====================
const token = localStorage.getItem('token') ?? '';
if (!token) {
  console.error('No token found in localStorage');
}

// ==================== Data Fetching ====================
const { result: navigationResult, refetch } = useGetNavigationTree(token);
const navigationsRaw = computed(() => navigationResult.value?.getNavigationTree || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddNavigation, handleEditNavigation, handleDeleteNavigation } = useNavigationService(safeRefetch);

// ==================== Data Transformation ====================
interface FlatNavigation extends Navigation {
  level: number;
  isParent: boolean;
  hasChildren: boolean;
  parentName?: string;
}

const flattenNavigations = (navigations: Navigation[]): FlatNavigation[] => {
  const flattened: FlatNavigation[] = [];
  
  navigations.forEach(navigation => {
    flattened.push({
      ...navigation,
      level: 0,
      isParent: true,
      hasChildren: !!(navigation.children && navigation.children.length > 0)
    });
    
    if (navigation.children && navigation.children.length > 0) {
      navigation.children.forEach((child) => {
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
};

const navigations = computed(() => flattenNavigations(navigationsRaw.value));

const parentMenuOptions = computed(() => 
  navigationsRaw.value
    .filter((nav: Navigation) => nav.is_header === true)
    .map((nav: Navigation) => ({ _id: nav._id, name: nav.name }))
);

// ==================== Pagination ====================
const currentPage = ref(1);
const itemsPerPage = ref(10);

const paginatedNavigations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return navigations.value.slice(start, end);
});

const getRowNumber = (index: number) => {
  return (currentPage.value - 1) * itemsPerPage.value + index + 1;
};

// ==================== Form State ====================
const navigationForm = ref<NavigationFormData>(createDefaultNavigationForm());
const editNavigationForm = ref<NavigationFormData>(createDefaultNavigationForm());
const selectedRolesAdd = ref<string[]>([]);
const selectedRolesEdit = ref<string[]>([]);
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);
const orderError = ref('');
const editOrderError = ref('');

// ==================== Form Actions ====================
const resetForm = () => {
  navigationForm.value = createDefaultNavigationForm();
  selectedRolesAdd.value = [];
  orderError.value = '';
};

const resetEditForm = () => {
  editNavigationForm.value = createDefaultNavigationForm();
  selectedRolesEdit.value = [];
  editOrderError.value = '';
};

const openEditModal = (navigation: FlatNavigation) => {
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
  selectedRolesEdit.value = Array.isArray(navigation.roles) ? [...navigation.roles] : [];
  editOrderError.value = '';
};

// ==================== Order Validation ====================
const validateOrder = (form: NavigationFormData, currentId?: string): string => {
  const currentOrder = Number(form.order);
  const parentId = form.parent_id;
  
  if (currentOrder <= 0) {
    return 'Urutan harus lebih dari 0';
  }

  let existingOrders: number[] = [];
  
  if (parentId) {
    const parentNav = navigationsRaw.value.find((nav: Navigation) => nav._id === parentId);
    if (parentNav?.children) {
      existingOrders = parentNav.children
        .filter((child: Navigation) => child._id !== currentId)
        .map((child: Navigation) => child.order);
    }
  } else {
    existingOrders = navigationsRaw.value
      .filter((nav: Navigation) => nav._id !== currentId)
      .map((nav: Navigation) => nav.order);
  }
  
  if (existingOrders.includes(currentOrder)) {
    return 'Urutan yang anda pilih sudah dipakai';
  }
  
  return '';
};

watch(() => navigationForm.value.order, () => {
  if (navigationForm.value.order) {
    orderError.value = validateOrder(navigationForm.value);
  }
});

watch(() => editNavigationForm.value.order, () => {
  if (editNavigationForm.value.order) {
    editOrderError.value = validateOrder(editNavigationForm.value, editNavigationForm.value._id);
  }
});

// ==================== Submit Handlers ====================
const onAddNavigation = async () => {
  orderError.value = validateOrder(navigationForm.value);
  if (orderError.value) return;
  
  isSubmitting.value = true;
  try {
    const { _id, ...navigationData } = navigationForm.value;
    await handleAddNavigation(navigationData, selectedRolesAdd.value);
    resetForm();
  } catch (error) {
    console.error('Error menambahkan navigasi:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const onEditNavigation = async () => {
  editOrderError.value = validateOrder(editNavigationForm.value, editNavigationForm.value._id);
  if (editOrderError.value) return;
  
  isEditSubmitting.value = true;
  try {
    await handleEditNavigation(editNavigationForm.value, selectedRolesEdit.value);
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
        { name: 'Navigasi' }
      ]"
    />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="border-bottom title-part-padding">
            <h4 class="card-title mb-0">Daftar Navigasi</h4>
          </div>

          <div class="card-body">
            <!-- Add Button -->
            <div class="d-flex justify-content-end mb-3">
              <ModalButton
                variant="info"
                font="medium"
                size="lg"
                dataBsTarget="add-navigation"
              >
                <i class="ti ti-plus me-1"></i>
                Tambah Navigasi
              </ModalButton>
            </div>

            <!-- Add Navigation Modal -->
            <NavigationFormModal
              modalId="add-navigation"
              title="Tambah Data Navigasi"
              headerColor="primary"
              :isSubmitting="isSubmitting"
              :navigationForm="navigationForm"
              :selectedRoles="selectedRolesAdd"
              :parentMenuOptions="parentMenuOptions"
              :orderError="orderError"
              @update:navigationForm="navigationForm = $event"
              @update:selectedRoles="selectedRolesAdd = $event"
              @submit="onAddNavigation"
              @cancel="resetForm"
            />

            <!-- Edit Navigation Modal -->
            <NavigationFormModal
              modalId="edit-navigation"
              title="Edit Data Navigasi"
              headerColor="warning"
              :isSubmitting="isEditSubmitting"
              :navigationForm="editNavigationForm"
              :selectedRoles="selectedRolesEdit"
              :parentMenuOptions="parentMenuOptions"
              :orderError="editOrderError"
              @update:navigationForm="editNavigationForm = $event"
              @update:selectedRoles="selectedRolesEdit = $event"
              @submit="onEditNavigation"
              @cancel="resetEditForm"
            />

            <!-- Navigations Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr class="text-center">
                    <th style="width: 60px;">No</th>
                    <th>Nama</th>
                    <th style="width: 100px;">Tipe</th>
                    <th>Route</th>
                    <th style="width: 80px;">Icon</th>
                    <th>Parent</th>
                    <th>Role</th>
                    <th style="width: 80px;">Urutan</th>
                    <th style="width: 180px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(navigation, index) in paginatedNavigations" 
                    :key="navigation._id" 
                    class="text-center align-middle"
                    :class="{
                      'bg-light': navigation.isParent,
                      'border-start border-2 border-primary': navigation.level === 1
                    }"
                  >
                    <td>{{ getRowNumber(index) }}</td>
                    
                    <!-- Name with indentation -->
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
                    
                    <!-- Type -->
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
                    
                    <!-- Order -->
                    <td>
                      <span class="badge bg-info">{{ navigation.order }}</span>
                    </td>
                    
                    <!-- Actions -->
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <!-- Edit Button -->
                        <ModalButton
                          variant="warning"
                          font="medium"
                          size="sm"
                          dataBsTarget="edit-navigation"
                          @click="openEditModal(navigation)"
                        >
                          <i class="ti ti-edit"></i>
                        </ModalButton>

                        <!-- Delete Button -->
                        <Button
                          variant="danger"
                          font="medium"
                          size="sm"
                          type="button"
                          @click="handleDeleteNavigation(navigation._id)"
                          class="me-1 m-t-10 mb-2 px-3 fs-3"
                        >
                          <i class="ti ti-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>

                  <!-- Empty State -->
                  <tr v-if="navigations.length === 0">
                    <td colspan="9" class="text-center py-4 text-muted">
                      <i class="ti ti-database-off fs-1 d-block mb-2"></i>
                      Tidak ada data navigasi
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <TablePagination
              v-if="navigations.length > 0"
              v-model:currentPage="currentPage"
              v-model:itemsPerPage="itemsPerPage"
              :totalItems="navigations.length"
              :pageSizeOptions="[10, 25, 50]"
            />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
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

code {
  font-size: 0.875rem;
  color: #e83e8c;
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}
</style>

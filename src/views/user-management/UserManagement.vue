<script setup lang="ts">
import { computed, ref } from 'vue';
import DashboardLayout from '../../components/DashboardLayout.vue';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.vue';
import Button from '../../components/Button/Button.vue';
import ModalButton from '../../components/Modal/ModalButton.vue';
import TablePagination from '../../components/Table/TablePagination.vue';
import UserCreateModal from './components/UserCreateModal.vue';
import UserRoleModal from './components/UserRoleModal.vue';
import { useManagedUsers } from '../../lib/api/UserManagementApi';
import { useUserManagementService } from '../../lib/service/UserManagementService';
import type { ManagedUser, UserCreateFormData, UserRoleFormData } from '../../types/UserManagement';
import { createDefaultUserCreateForm, createDefaultUserRoleForm, USER_ROLE_OPTIONS } from '../../types/UserManagement';

const token = localStorage.getItem('token') || '';
const { result, loading, refetch } = useManagedUsers(token);
const users = computed<ManagedUser[]>(() => result.value?.getAllUsers || []);
const safeRefetch = async () => (await refetch()) ?? Promise.resolve();
const { handleAddUser, handleEditUserRole, handleDeleteUser } = useUserManagementService(safeRefetch);
const searchQuery = ref('');
const selectedRole = ref('');
const filtered = computed(() => users.value.filter((user) => {
  const query = searchQuery.value.toLowerCase().trim();
  const matchesQuery = !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
  const matchesRole = !selectedRole.value || user.role === selectedRole.value;
  return matchesQuery && matchesRole;
}));
const currentPage = ref(1);
const itemsPerPage = ref(10);
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value));
const createForm = ref<UserCreateFormData>(createDefaultUserCreateForm());
const roleForm = ref<UserRoleFormData>(createDefaultUserRoleForm());
const isSubmitting = ref(false);
const isEditSubmitting = ref(false);
const resetCreateForm = () => { createForm.value = createDefaultUserCreateForm(); };
const resetRoleForm = () => { roleForm.value = createDefaultUserRoleForm(); };
const openEditRole = (user: ManagedUser) => { roleForm.value = { _id: user._id, name: user.name, email: user.email, role: user.role }; };
const onAdd = async () => { isSubmitting.value = true; try { await handleAddUser(createForm.value); resetCreateForm(); } finally { isSubmitting.value = false; } };
const onEditRole = async () => { isEditSubmitting.value = true; try { await handleEditUserRole(roleForm.value); resetRoleForm(); } finally { isEditSubmitting.value = false; } };
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('id-ID') : '-';
</script>

<template>
  <DashboardLayout>
    <Breadcrumb title="Manajemen User" :items="[{ name: 'Dashboard', href: '/dashboard' }, { name: 'Manajemen User' }]" />
    <div class="card">
      <div class="border-bottom title-part-padding"><h4 class="card-title mb-0">Daftar User</h4></div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-7"><div class="input-group"><span class="input-group-text bg-primary text-white"><i class="ti ti-search"></i></span><input v-model="searchQuery" class="form-control" placeholder="Cari nama atau email..." @keyup="currentPage = 1" /></div></div>
          <div class="col-md-3"><select v-model="selectedRole" class="form-select" @change="currentPage = 1"><option value="">Semua Role</option><option v-for="role in USER_ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option></select></div>
          <div class="col-md-2"><button class="btn btn-outline-secondary w-100" @click="searchQuery = ''; selectedRole = ''; currentPage = 1"><i class="ti ti-refresh me-1"></i>Reset</button></div>
        </div>
        <div class="d-flex justify-content-end mb-3"><ModalButton variant="info" font="medium" size="lg" dataBsTarget="add-user-management"><i class="ti ti-plus me-1"></i>Tambah User</ModalButton></div>
        <UserCreateModal modalId="add-user-management" :isSubmitting="isSubmitting" :form="createForm" @update:form="createForm = $event" @submit="onAdd" @cancel="resetCreateForm" />
        <UserRoleModal modalId="edit-user-management" :isSubmitting="isEditSubmitting" :form="roleForm" @update:form="roleForm = $event" @submit="onEditRole" @cancel="resetRoleForm" />
        <div class="table-responsive"><table class="table table-bordered table-hover"><thead class="table-light"><tr class="text-center"><th>No</th><th>Nama</th><th>Email</th><th>Role</th><th>Dibuat</th><th>Diupdate</th><th>Aksi</th></tr></thead><tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-4">Memuat data user...</td></tr>
          <tr v-for="(user, index) in paginated" :key="user._id" class="text-center align-middle" v-show="!loading"><td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td><td>{{ user.name }}</td><td>{{ user.email }}</td><td><span class="badge" :class="user.role === 'super_admin' ? 'bg-danger' : user.role === 'member' ? 'bg-primary' : 'bg-secondary'">{{ user.role }}</span></td><td>{{ formatDate(user.createdAt) }}</td><td>{{ formatDate(user.updatedAt) }}</td><td><div class="d-flex justify-content-center gap-1"><ModalButton variant="warning" font="medium" size="sm" dataBsTarget="edit-user-management" @click="openEditRole(user)"><i class="ti ti-edit"></i></ModalButton><Button variant="danger" font="medium" size="sm" type="button" @click="handleDeleteUser(user._id)"><i class="ti ti-trash"></i></Button></div></td></tr>
          <tr v-if="!loading && paginated.length === 0"><td colspan="7" class="text-center text-muted py-4">Tidak ada data user</td></tr>
        </tbody></table></div>
        <TablePagination v-if="!loading && filtered.length > 0" v-model:currentPage="currentPage" v-model:itemsPerPage="itemsPerPage" :totalItems="filtered.length" :pageSizeOptions="[10, 25, 50]" />
      </div>
    </div>
  </DashboardLayout>
</template>

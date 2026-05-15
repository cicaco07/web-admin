import { alertConfirm, alertError, alertSuccess } from '../alert';
import { useDeleteManagedUser, useRegisterManagedUser, useUpdateManagedUserRole } from '../api/UserManagementApi';
import type { UserCreateFormData, UserRoleFormData } from '../../types/UserManagement';

interface BootstrapModalApi { getOrCreateInstance(element: HTMLElement | null): { hide(): void } }
interface WindowWithBootstrap extends Window { bootstrap?: { Modal?: BootstrapModalApi } }

const hideModal = (id: string) => {
  (window as WindowWithBootstrap).bootstrap?.Modal?.getOrCreateInstance(document.getElementById(id))?.hide();
};

export const useUserManagementService = (refetch: () => Promise<unknown>) => {
  const token = localStorage.getItem('token') || '';
  const { registerManagedUser } = useRegisterManagedUser(token);
  const { updateManagedUserRole } = useUpdateManagedUserRole(token);
  const { deleteManagedUser } = useDeleteManagedUser(token);

  const handleAddUser = async (form: UserCreateFormData) => {
    try {
      await registerManagedUser({ registerInput: form });
      await refetch();
      alertSuccess('User berhasil ditambahkan!');
      hideModal('add-user-management');
    } catch (error) {
      alertError('Gagal menambahkan user.');
      throw error;
    }
  };

  const handleEditUserRole = async (form: UserRoleFormData) => {
    try {
      if (!form._id) throw new Error('Missing user id');
      await updateManagedUserRole({ updateUserRoleInput: { userId: form._id, role: form.role } });
      await refetch();
      alertSuccess('Role user berhasil diupdate!');
      hideModal('edit-user-management');
    } catch (error) {
      alertError('Gagal mengupdate role user.');
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!(await alertConfirm('Yakin ingin menghapus user ini?'))) return;
    await deleteManagedUser({ userId });
    await refetch();
    alertSuccess('User berhasil dihapus!');
  };

  return { handleAddUser, handleEditUserRole, handleDeleteUser };
};

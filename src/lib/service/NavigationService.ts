import { alertConfirm, alertError, alertSuccess } from "../alert";
import { useCreateNavigation, useDeleteNavigation, useUpdateNavigation } from "../api/NavigationApi";

export function useNavigationService(refetch: () => Promise<any>) {
  const token = localStorage.getItem('token') || '';
  const { createNavigation } = useCreateNavigation(token);
  const { updateNavigation } = useUpdateNavigation(token);
  const { deleteNavigation } = useDeleteNavigation(token);

  const handleAddNavigation = async (navigationForm: any, roleType: string[]) => {
    try {
      const createNavigationInput = {
        ...navigationForm,
        order: Number(navigationForm.order),
        level: Number(navigationForm.level),
        roles: [...roleType]
      }
      await createNavigation({ createNavigationInput });
      refetch();
      alertSuccess('Navigasi berhasil ditambahkan');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-navigation')).hide();
    } catch (error) {
      alertError('Gagal menambahkan navigasi');
      console.error(error);
      throw error;
    }
  };

  const handleEditNavigation = async (navigationForm: any, roleType: string[]) => {
    try {
      const updateNavigationInput = {
        ...navigationForm,
        order: Number(navigationForm.order),
        level: Number(navigationForm.level),
        roles: [...roleType]
      }
      await updateNavigation({ updateNavigationInput });
      refetch();
      alertSuccess('Navigasi berhasil diperbarui');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-navigation')).hide();
    } catch (error) {
      alertError('Gagal memperbarui navigasi');
      console.error(error);
      throw error;
    }
  }

  const handleDeleteNavigation = async (id: string) => {
    const confirm = await alertConfirm('Apakah Anda yakin ingin menghapus navigasi ini?');
    if (confirm) {
      try {
        await deleteNavigation({ id });
        refetch();
        alertSuccess('Navigasi berhasil dihapus');
      } catch (error) {
        alertError('Gagal menghapus navigasi');
        console.error(error);
        throw error;
      }
    }
  };

  return {
    handleAddNavigation,
    handleEditNavigation,
    handleDeleteNavigation
  };
}
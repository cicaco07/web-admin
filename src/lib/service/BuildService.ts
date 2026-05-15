import { alertConfirm, alertError, alertSuccess } from "../alert";
import { useCreateBuild, useDeleteBuild, useUpdateBuild } from "../api/BuildApi";

export const useBuildService = (refetch: () => Promise<any>) => {
  const token = localStorage.getItem('token') || '';
  const { createBuild } = useCreateBuild(token);
  const { updateBuild } = useUpdateBuild(token);
  const { deleteBuild } = useDeleteBuild(token);

  const handleAddBuild = async (buildForm: any) => {
    console.log("handleAddBuild", buildForm);
    try {
      const createBuildInput = {
        name: buildForm.name,
        role: buildForm.role,
        description: buildForm.description,
        heroId: buildForm.heroId,
        items: buildForm.items,
        emblemIds: buildForm.emblemIds,
        battleSpellIds: buildForm.battleSpellIds,
      };
      await createBuild({ createBuildInput });
      await refetch();
      alertSuccess('Build berhasil ditambahkan!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-build'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan build.');
      console.error(error);
      throw error;
    }
  }

  const handleEditBuild = async (editBuild: any) => {
    try {
      const updateBuildInput = {
        name: editBuild.name,
        role: editBuild.role,
        description: editBuild.description,
        heroId: editBuild.heroId,
        items: editBuild.items,
        emblemIds: editBuild.emblemIds,
        battleSpellIds: editBuild.battleSpellIds,
      };
      await updateBuild({ id: editBuild._id, updateBuildInput });
      await refetch();
      alertSuccess('Build berhasil diupdate!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-build'))?.hide();
    } catch (error) {
      alertError('Gagal mengupdate build.');
      console.error(error);
      throw error;
    }
  }

  const handleDeleteBuild = async (id: string) => {
    const confirm = await alertConfirm('Yakin ingin menghapus build ini? Data build akan dihapus permanen!');
    if (confirm == true) {
      try {
        await deleteBuild({ id });
        await refetch();
        alertSuccess('Build berhasil dihapus!');
      } catch (error) {
        alertError('Gagal menghapus build.');
        console.error(error);
        throw error;
      }
    }
  };

  return {
    handleAddBuild,
    handleEditBuild,
    handleDeleteBuild
  };
}

import { alertConfirm, alertError, alertSuccess } from "../alert";
import { useCreateEmblem, useDeleteEmblem, useUpdateEmblem } from "../api/EmblemApi";

export const useEmblemService = (refetch: () => Promise<any>) => {

  const { createEmblem } = useCreateEmblem();
  const { updateEmblem } = useUpdateEmblem();
  const { deleteEmblem } = useDeleteEmblem();

  const handleAddEmblem = async (emblemForm: any) => {
    try {
      const input = {
        ...emblemForm,
      };
      await createEmblem({ input });
      await refetch();
      alertSuccess('Emblem berhasil ditambahkan!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-emblem'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan emblem.');
      console.error(error);
      throw error;
    }
  };

  const handleEditEmblem = async (editEmblem: any) => {
    try {
      const input = {
        name: editEmblem.name,
        type: editEmblem.type,
        icon: editEmblem.icon,
        benefit: editEmblem.benefit,
        description: editEmblem.description,
        cooldown: Number(editEmblem.cooldown),
      };
      await updateEmblem({ id: editEmblem._id, input });
      await refetch();
      alertSuccess('Emblem berhasil diupdate!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-emblem'))?.hide();
    } catch (error) {
      alertError('Gagal mengupdate emblem.');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteEmblem = async (id: string) => {
    const confirm = await alertConfirm('Yakin ingin menghapus emblem ini? Data emblem akan dihapus permanen!');
    if (confirm == true) {
      try {
        await deleteEmblem({ id });
        await refetch();
        alertSuccess('Emblem berhasil dihapus!');
      } catch (error) {
        alertError('Gagal menghapus emblem.');
        console.error(error);
        throw error;
      }
    }
  };

  return {
    handleAddEmblem,
    handleDeleteEmblem,
    handleEditEmblem
  };
};
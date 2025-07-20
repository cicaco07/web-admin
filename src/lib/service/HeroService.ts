// lib/services/HeroService.ts
import { useCreateHero, useUpdateHero, useDeleteHero } from '../api/HeroApi';
import { alertSuccess, alertError, alertConfirm } from '../alert';

export function useHeroService(refetch: () => Promise<any>) {
  const { createHero } = useCreateHero();
  const { updateHero } = useUpdateHero();
  const { deleteHero } = useDeleteHero();

  const handleAddHero = async (heroForm: any, editRole: string[], editType: string[]) => {
    console.log('handleAddHero', heroForm, editRole, editType);
    try {
      const input = {
        ...heroForm,
        durability: Number(heroForm.durability),
        offense: Number(heroForm.offense),
        control_effect: Number(heroForm.control_effect),
        difficulty: Number(heroForm.difficulty),
        role: [...editRole],
        type: [...editType]
      };
      await createHero({ input });
      await refetch();
      alertSuccess('Hero berhasil ditambahkan!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-hero'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan hero.');
      console.error(error);
      throw error;
    }
  };

  const handleEditHero = async (editHero: any, roleEdit: string[], typeEdit: string[]) => {
    try {
      const input = {
        name: editHero.name,
        alias: editHero.alias,
        role: [...roleEdit],
        type: [...typeEdit],
        short_description: editHero.short_description,
        avatar: editHero.avatar,
        image: editHero.image,
        release_date: editHero.release_date,
        durability: Number(editHero.durability),
        offense: Number(editHero.offense),
        control_effect: Number(editHero.control_effect),
        difficulty: Number(editHero.difficulty)
      };
      await updateHero({ id: editHero._id, input });
      await refetch();
      alertSuccess('Hero berhasil diupdate!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-hero'))?.hide();
    } catch (error) {
      alertError('Gagal mengupdate hero.');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteHero = async (id: string) => {
    const confirm = await alertConfirm('Yakin ingin hapus hero ini? Data hero akan dihapus permanen!');
    if (confirm == true) {
      try {
        await deleteHero({ id });
        await refetch();
        alertSuccess('Data hero berhasil dihapus.');
      } catch (error) {
        alertError('Gagal menghapus data hero.');
        console.error(error);
        throw error;
      }
    }
  };

  return {
    handleAddHero,
    handleEditHero,
    handleDeleteHero
  };
}

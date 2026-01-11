import { useCreateHero, useUpdateHero, useDeleteHero } from '../api/HeroApi';
import { alertSuccess, alertError, alertConfirm } from '../alert';

export function useHeroService(refetch: () => Promise<any>) {
  const token = localStorage.getItem('token') || '';
  const { createHero } = useCreateHero(token);
  const { updateHero } = useUpdateHero(token);
  const { deleteHero } = useDeleteHero(token);

  const handleAddHero = async (heroForm: any, editRole: string[], editType: string[]) => {
    try {
      const createHeroInput = {
        ...heroForm,
        hero_order: Number(heroForm.hero_order),
        durability: Number(heroForm.durability),
        offense: Number(heroForm.offense),
        control_effect: Number(heroForm.control_effect),
        difficulty: Number(heroForm.difficulty),
        role: [...editRole],
        type: [...editType]
      };
      await createHero({ createHeroInput });
      await refetch();
      alertSuccess('Hero berhasil ditambahkan!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-hero'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan hero.');
      console.error(error);
      throw error;
    }
  };

  const handleEditHero = async (heroForm: any, roleEdit: string[], typeEdit: string[]) => {
    try {
      const input = {
        name: heroForm.name,
        alias: heroForm.alias,
        role: [...roleEdit],
        type: [...typeEdit],
        speciality: heroForm.speciality,
        region: heroForm.region,
        hero_order: Number(heroForm.hero_order),
        short_description: heroForm.short_description,
        avatar: heroForm.avatar,
        image: heroForm.image,
        release_date: heroForm.release_date,
        durability: Number(heroForm.durability),
        offense: Number(heroForm.offense),
        control_effect: Number(heroForm.control_effect),
        difficulty: Number(heroForm.difficulty)
      };
      await updateHero({ id: heroForm._id, updateHeroInput: input });
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

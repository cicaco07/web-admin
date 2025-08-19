import { alertConfirm, alertError, alertSuccess } from "../alert";
import { useCreateBattleSpell, useDeleteBattleSpell, useUpdateBattleSpell } from "../api/BattleSpellApi"

export const useBattleSpellService = (refetch: () => Promise<any>) => {
  const token = localStorage.getItem('token') || '';
  const { createBattleSpell } = useCreateBattleSpell(token);
  const { updateBattleSpell } = useUpdateBattleSpell(token);
  const { deleteBattleSpell } = useDeleteBattleSpell(token);

  async function uploadImage(file: File){
    try {
      const formData = new FormData();
      formData.append('icon', file);

      const response = await fetch('http://localhost:3000/battlespell/battlespell-icon', {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to upload image' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      throw new Error(`Image upload failed: ${errorMessage}`);
    }
  }

  const handleAddBattleSpell = async (battleSpellForm: any) => {
    try {
      let iconPath = '';
      
      if (battleSpellForm.icon instanceof File) {
        iconPath = await uploadImage(battleSpellForm.icon);
      } else if (typeof battleSpellForm.icon === 'string' && battleSpellForm.icon !== '') {
        throw new Error('Icon must be a File object, not a string');
      } else {
        throw new Error('Please select an icon for the battle spell');
      }

      const createBattleSpellInput = {
        name: battleSpellForm.name,
        tag: battleSpellForm.tag,
        description: battleSpellForm.description,
        icon: iconPath,
        cooldown: Number(battleSpellForm.cooldown)
      };
      await createBattleSpell({ createBattleSpellInput });
      await refetch();
      alertSuccess('Battle spell berhasil di tambahkan');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('add-battle-spell'))?.hide();
    } catch (error) {
      alertError('Gagal menambahkan battle spell');
      console.error(error);
      throw error;
    }
  };

  const handleEditBattleSpell = async (battleSpellForm: any) => {
    try {
      let iconPath = '';

      if (battleSpellForm.icon instanceof File) {
        iconPath = await uploadImage(battleSpellForm.icon);
      } else if (typeof battleSpellForm.icon === 'string' && battleSpellForm.icon !== '') {
        iconPath = battleSpellForm.icon;
      } else {
        throw new Error('Please select an icon for the battle spell');
      }

      const updateBattleSpellInput = {
        name: battleSpellForm.name,
        tag: battleSpellForm.tag,
        description: battleSpellForm.description,
        icon: iconPath,
        cooldown: Number(battleSpellForm.cooldown)
      };
      await updateBattleSpell({ id: battleSpellForm._id, updateBattleSpellInput });
      await refetch();
      alertSuccess('Battle spell berhasil diupdate!');
      (window as any).bootstrap?.Modal?.getOrCreateInstance(document.getElementById('edit-battle-spell'))?.hide();
    } catch (error) {
      alertError('Gagal mengedit battle spell');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteBattleSpell = async (id: string) => {
    const confirm = await alertConfirm('Yakin ingin menghapus battle spell ini? Data battle spell akan dihapus permanen!');
    if (confirm) {
      try {
        await deleteBattleSpell({ id });
        await refetch();
        alertSuccess('Battle spell berhasil dihapus!');
      } catch (error) {
        alertError('Gagal menghapus battle spell');
        console.error(error);
      }
    }
  }

  return {
    handleAddBattleSpell,
    handleEditBattleSpell,
    handleDeleteBattleSpell
  };
}
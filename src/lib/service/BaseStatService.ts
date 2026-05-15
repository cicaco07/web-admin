import { alertConfirm, alertError, alertSuccess } from "../alert";
import { useCreateBaseStat, useDeleteBaseStat, useUpdateBaseStat } from "../api/BaseStatApi";
import type { BaseStatFormData } from "../../types/BaseStat";

interface BootstrapModalApi {
  getOrCreateInstance(element: HTMLElement | null): { hide(): void };
}

interface BootstrapApi {
  Modal?: BootstrapModalApi;
}

interface WindowWithBootstrap extends Window {
  bootstrap?: BootstrapApi;
}

const STAT_FIELDS = [
  'hp', 'mana', 'energy',
  'hp_regen', 'mana_regen', 'energy_regen',
  'physical_attack', 'physical_defense',
  'magic_power', 'magic_defense',
  'attack_speed', 'movement_speed',
  'attack_speed_ratio', 'spell_vamp_ratio',
  'attack_range',
] as const;

const buildInput = (form: BaseStatFormData) => {
  const input: Record<string, number | string> = {
    heroId: form.heroId,
  };
  for (const field of STAT_FIELDS) {
    const raw = form[field];
    const num = typeof raw === 'number' ? raw : Number(raw);
    input[field] = Number.isFinite(num) ? Math.trunc(num) : 0;
  }
  return input;
};

const hideModal = (id: string) => {
  (window as WindowWithBootstrap).bootstrap?.Modal?.getOrCreateInstance(document.getElementById(id))?.hide();
};

export const useBaseStatService = (refetch: () => Promise<any>) => {
  const token = localStorage.getItem('token') || '';
  const { createBaseStat } = useCreateBaseStat(token);
  const { updateBaseStat } = useUpdateBaseStat(token);
  const { deleteBaseStat } = useDeleteBaseStat(token);

  const handleAddBaseStat = async (form: BaseStatFormData) => {
    try {
      const createBaseStatInput = buildInput(form);
      await createBaseStat({ createBaseStatInput });
      await refetch();
      alertSuccess('Base stat berhasil ditambahkan!');
      hideModal('add-base-stat');
    } catch (error) {
      alertError('Gagal menambahkan base stat.');
      console.error(error);
      throw error;
    }
  };

  const handleEditBaseStat = async (form: BaseStatFormData) => {
    try {
      if (!form._id) throw new Error('Missing base stat id for update.');
      const updateBaseStatInput = buildInput(form);
      await updateBaseStat({ id: form._id, updateBaseStatInput });
      await refetch();
      alertSuccess('Base stat berhasil diupdate!');
      hideModal('edit-base-stat');
    } catch (error) {
      alertError('Gagal mengupdate base stat.');
      console.error(error);
      throw error;
    }
  };

  const handleDeleteBaseStat = async (id: string) => {
    const confirm = await alertConfirm('Yakin ingin menghapus base stat ini? Data akan dihapus permanen!');
    if (confirm == true) {
      try {
        await deleteBaseStat({ id });
        await refetch();
        alertSuccess('Base stat berhasil dihapus!');
      } catch (error) {
        alertError('Gagal menghapus base stat.');
        console.error(error);
        throw error;
      }
    }
  };

  return {
    handleAddBaseStat,
    handleEditBaseStat,
    handleDeleteBaseStat,
  };
};

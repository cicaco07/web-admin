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
  'spell_vamp_ratio', 'attack_range',
  'crit_rate', 'crit_damage',
  'physical_pen', 'magical_pen',
  'lifesteal', 'resilience',
  'crit_damage_reduction', 'received_heal',
] as const;

const GROWTH_FIELDS = [
  'hp_growth', 'mana_growth', 'energy_growth',
  'hp_regen_growth', 'mana_regen_growth', 'energy_regen_growth',
  'physical_attack_growth', 'physical_defense_growth',
  'magic_power_growth', 'magic_defense_growth',
  'attack_speed_growth',
] as const;

const buildInput = (form: BaseStatFormData) => {
  const input: Record<string, number | string> = {
    heroId: form.heroId,
  };
  for (const field of STAT_FIELDS) {
    const raw = form[field];
    const num = typeof raw === 'number' ? raw : Number(raw);
    input[field] = Number.isFinite(num) ? num : 0;
  }
  for (const field of GROWTH_FIELDS) {
    const raw = form[field];
    const num = typeof raw === 'number' ? raw : Number(raw);
    input[field] = Number.isFinite(num) ? num : 0;
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

export interface BaseStat {
  _id: string;
  hero: {
    _id: string;
    name: string;
    image: string;
    role: string[];
  };
  hp: number;
  mana: number;
  energy: number;
  hp_regen: number;
  mana_regen: number;
  energy_regen: number;
  physical_attack: number;
  physical_defense: number;
  magic_power: number;
  magic_defense: number;
  attack_speed: number;
  movement_speed: number;
  attack_speed_ratio: number;
  spell_vamp_ratio: number;
  attack_range: number;
}

export interface BaseStatFormData {
  _id?: string;
  heroId: string;
  hp: number;
  mana: number;
  energy: number;
  hp_regen: number;
  mana_regen: number;
  energy_regen: number;
  physical_attack: number;
  physical_defense: number;
  magic_power: number;
  magic_defense: number;
  attack_speed: number;
  movement_speed: number;
  attack_speed_ratio: number;
  spell_vamp_ratio: number;
  attack_range: number;
}

export interface BaseStatField {
  key: keyof Omit<BaseStatFormData, '_id' | 'heroId'>;
  label: string;
}

export interface BaseStatFieldGroup {
  title: string;
  icon: string;
  color: string;
  fields: BaseStatField[];
}

export const BASE_STAT_FIELD_GROUPS: BaseStatFieldGroup[] = [
  {
    title: 'Vitality',
    icon: 'ti ti-heart',
    color: 'danger',
    fields: [
      { key: 'hp', label: 'HP' },
      { key: 'mana', label: 'Mana' },
      { key: 'energy', label: 'Energy' },
      { key: 'hp_regen', label: 'HP Regen' },
      { key: 'mana_regen', label: 'Mana Regen' },
      { key: 'energy_regen', label: 'Energy Regen' },
    ],
  },
  {
    title: 'Offense',
    icon: 'ti ti-sword',
    color: 'warning',
    fields: [
      { key: 'physical_attack', label: 'Physical Attack' },
      { key: 'magic_power', label: 'Magic Power' },
      { key: 'attack_speed', label: 'Attack Speed' },
      { key: 'attack_speed_ratio', label: 'Attack Speed Ratio' },
      { key: 'spell_vamp_ratio', label: 'Spell Vamp Ratio' },
      { key: 'attack_range', label: 'Attack Range' },
    ],
  },
  {
    title: 'Defense',
    icon: 'ti ti-shield',
    color: 'info',
    fields: [
      { key: 'physical_defense', label: 'Physical Defense' },
      { key: 'magic_defense', label: 'Magic Defense' },
    ],
  },
  {
    title: 'Mobility',
    icon: 'ti ti-run',
    color: 'success',
    fields: [
      { key: 'movement_speed', label: 'Movement Speed' },
    ],
  },
];

export const createDefaultBaseStatForm = (): BaseStatFormData => ({
  heroId: '',
  hp: 0,
  mana: 0,
  energy: 0,
  hp_regen: 0,
  mana_regen: 0,
  energy_regen: 0,
  physical_attack: 0,
  physical_defense: 0,
  magic_power: 0,
  magic_defense: 0,
  attack_speed: 0,
  movement_speed: 0,
  attack_speed_ratio: 0,
  spell_vamp_ratio: 0,
  attack_range: 0,
});

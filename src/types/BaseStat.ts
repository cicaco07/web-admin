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
  spell_vamp_ratio: number;
  attack_range: number;
  crit_rate: number;
  crit_damage: number;
  physical_pen: number;
  magical_pen: number;
  lifesteal: number;
  resilience: number;
  crit_damage_reduction: number;
  received_heal: number;
  hp_growth: number | null;
  mana_growth: number | null;
  energy_growth: number | null;
  hp_regen_growth: number | null;
  mana_regen_growth: number | null;
  energy_regen_growth: number | null;
  physical_attack_growth: number | null;
  physical_defense_growth: number | null;
  magic_power_growth: number | null;
  magic_defense_growth: number | null;
  attack_speed_growth: number | null;
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
  spell_vamp_ratio: number;
  attack_range: number;
  crit_rate: number;
  crit_damage: number;
  physical_pen: number;
  magical_pen: number;
  lifesteal: number;
  resilience: number;
  crit_damage_reduction: number;
  received_heal: number;
  hp_growth: number;
  mana_growth: number;
  energy_growth: number;
  hp_regen_growth: number;
  mana_regen_growth: number;
  energy_regen_growth: number;
  physical_attack_growth: number;
  physical_defense_growth: number;
  magic_power_growth: number;
  magic_defense_growth: number;
  attack_speed_growth: number;
}

export type BaseStatGrowthKey =
  | 'hp_growth'
  | 'mana_growth'
  | 'energy_growth'
  | 'hp_regen_growth'
  | 'mana_regen_growth'
  | 'energy_regen_growth'
  | 'physical_attack_growth'
  | 'physical_defense_growth'
  | 'magic_power_growth'
  | 'magic_defense_growth'
  | 'attack_speed_growth';

export interface BaseStatField {
  key: keyof Omit<BaseStatFormData, '_id' | 'heroId'>;
  label: string;
  growthKey?: BaseStatGrowthKey;
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
      { key: 'hp', label: 'HP', growthKey: 'hp_growth' },
      { key: 'mana', label: 'Mana', growthKey: 'mana_growth' },
      { key: 'energy', label: 'Energy', growthKey: 'energy_growth' },
      { key: 'hp_regen', label: 'HP Regen', growthKey: 'hp_regen_growth' },
      { key: 'mana_regen', label: 'Mana Regen', growthKey: 'mana_regen_growth' },
      { key: 'energy_regen', label: 'Energy Regen', growthKey: 'energy_regen_growth' },
    ],
  },
  {
    title: 'Offense',
    icon: 'ti ti-sword',
    color: 'warning',
    fields: [
      { key: 'physical_attack', label: 'Physical Attack', growthKey: 'physical_attack_growth' },
      { key: 'magic_power', label: 'Magic Power', growthKey: 'magic_power_growth' },
      { key: 'attack_speed', label: 'Attack Speed', growthKey: 'attack_speed_growth' },
      { key: 'spell_vamp_ratio', label: 'Spell Vamp Ratio' },
      { key: 'attack_range', label: 'Attack Range' },
      { key: 'crit_rate', label: 'Crit Rate' },
      { key: 'crit_damage', label: 'Crit Damage' },
      { key: 'physical_pen', label: 'Physical PEN' },
      { key: 'magical_pen', label: 'Magical PEN' },
      { key: 'lifesteal', label: 'Lifesteal' },
    ],
  },
  {
    title: 'Defense',
    icon: 'ti ti-shield',
    color: 'info',
    fields: [
      { key: 'physical_defense', label: 'Physical Defense', growthKey: 'physical_defense_growth' },
      { key: 'magic_defense', label: 'Magic Defense', growthKey: 'magic_defense_growth' },
      { key: 'resilience', label: 'Resilience' },
      { key: 'crit_damage_reduction', label: 'Crit Damage Reduction' },
      { key: 'received_heal', label: 'Pemulihan Diterima' },
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
  spell_vamp_ratio: 0,
  attack_range: 0,
  crit_rate: 0,
  crit_damage: 0,
  physical_pen: 0,
  magical_pen: 0,
  lifesteal: 0,
  resilience: 0,
  crit_damage_reduction: 0,
  received_heal: 0,
  hp_growth: 0,
  mana_growth: 0,
  energy_growth: 0,
  hp_regen_growth: 0,
  mana_regen_growth: 0,
  energy_regen_growth: 0,
  physical_attack_growth: 0,
  physical_defense_growth: 0,
  magic_power_growth: 0,
  magic_defense_growth: 0,
  attack_speed_growth: 0,
});

export const BASE_STAT_MIN_LEVEL = 1;
export const BASE_STAT_MAX_LEVEL = 15;

export const BASE_STAT_LEVELS: number[] = Array.from(
  { length: BASE_STAT_MAX_LEVEL - BASE_STAT_MIN_LEVEL + 1 },
  (_, i) => BASE_STAT_MIN_LEVEL + i,
);

const roundStat = (value: number): number => Math.round(value * 100) / 100;

export const computeStatAtLevel = (
  base: number | null | undefined,
  growth: number | null | undefined,
  level: number,
): number => {
  const baseValue = typeof base === 'number' && Number.isFinite(base) ? base : 0;
  const growthPerLevel = typeof growth === 'number' && Number.isFinite(growth) ? growth : 0;
  return roundStat(baseValue + growthPerLevel * (level - BASE_STAT_MIN_LEVEL));
};

export const BASE_STAT_GROWTH_FIELDS: BaseStatField[] = BASE_STAT_FIELD_GROUPS
  .flatMap((group) => group.fields)
  .filter((field): field is BaseStatField & { growthKey: BaseStatGrowthKey } =>
    Boolean(field.growthKey),
  );

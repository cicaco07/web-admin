import type { BaseStat } from '../../types/BaseStat';
import { exportSheetsToExcel, readExcelAsRows, toNum, toStr } from '../../utils/excel';

export interface BaseStatImportInput {
  heroName: string;
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

interface BaseStatImportRow {
  'Nama Hero'?: string;
  HP?: string | number;
  Mana?: string | number;
  Energy?: string | number;
  'HP Regen'?: string | number;
  'Mana Regen'?: string | number;
  'Energy Regen'?: string | number;
  'Physical Attack'?: string | number;
  'Physical Defense'?: string | number;
  'Magic Power'?: string | number;
  'Magic Defense'?: string | number;
  'Attack Speed'?: string | number;
  'Movement Speed'?: string | number;
  'Spell Vamp Ratio'?: string | number;
  'Attack Range'?: string | number;
  'Crit Rate'?: string | number;
  'Crit Damage'?: string | number;
  'Physical PEN'?: string | number;
  'Magical PEN'?: string | number;
  Lifesteal?: string | number;
  Resilience?: string | number;
  'Crit Damage Reduction'?: string | number;
  'Pemulihan Diterima'?: string | number;
  'HP Growth'?: string | number;
  'Mana Growth'?: string | number;
  'Energy Growth'?: string | number;
  'HP Regen Growth'?: string | number;
  'Mana Regen Growth'?: string | number;
  'Energy Regen Growth'?: string | number;
  'Physical Attack Growth'?: string | number;
  'Physical Defense Growth'?: string | number;
  'Magic Power Growth'?: string | number;
  'Magic Defense Growth'?: string | number;
  'Attack Speed Growth'?: string | number;
}

const BASE_STAT_HEADERS = [
  'Nama Hero',
  'HP',
  'Mana',
  'Energy',
  'HP Regen',
  'Mana Regen',
  'Energy Regen',
  'Physical Attack',
  'Physical Defense',
  'Magic Power',
  'Magic Defense',
  'Attack Speed',
  'Movement Speed',
  'Spell Vamp Ratio',
  'Attack Range',
  'Crit Rate',
  'Crit Damage',
  'Physical PEN',
  'Magical PEN',
  'Lifesteal',
  'Resilience',
  'Crit Damage Reduction',
  'Pemulihan Diterima',
  'HP Growth',
  'Mana Growth',
  'Energy Growth',
  'HP Regen Growth',
  'Mana Regen Growth',
  'Energy Regen Growth',
  'Physical Attack Growth',
  'Physical Defense Growth',
  'Magic Power Growth',
  'Magic Defense Growth',
  'Attack Speed Growth',
];

const BASE_STAT_WIDTHS = [
  22, 10, 10, 10, 12, 12, 14, 16, 18, 14, 16, 14, 16, 18, 14,
  12, 14, 14, 14, 12, 12, 20, 20,
  14, 14, 14, 16, 16, 18, 20, 20, 18, 18, 18,
];

const buildBaseStatRows = (data: BaseStat[]) =>
  data.map((stat) => [
    stat.hero.name,
    stat.hp,
    stat.mana,
    stat.energy,
    stat.hp_regen,
    stat.mana_regen,
    stat.energy_regen,
    stat.physical_attack,
    stat.physical_defense,
    stat.magic_power,
    stat.magic_defense,
    stat.attack_speed,
    stat.movement_speed,
    stat.spell_vamp_ratio,
    stat.attack_range,
    stat.crit_rate ?? 0,
    stat.crit_damage ?? 0,
    stat.physical_pen ?? 0,
    stat.magical_pen ?? 0,
    stat.lifesteal ?? 0,
    stat.resilience ?? 0,
    stat.crit_damage_reduction ?? 0,
    stat.received_heal ?? 0,
    stat.hp_growth ?? 0,
    stat.mana_growth ?? 0,
    stat.energy_growth ?? 0,
    stat.hp_regen_growth ?? 0,
    stat.mana_regen_growth ?? 0,
    stat.energy_regen_growth ?? 0,
    stat.physical_attack_growth ?? 0,
    stat.physical_defense_growth ?? 0,
    stat.magic_power_growth ?? 0,
    stat.magic_defense_growth ?? 0,
    stat.attack_speed_growth ?? 0,
  ]);

export const exportBaseStats = (data: BaseStat[]): void => {
  exportSheetsToExcel(
    [
      {
        name: 'Base Stat',
        aoa: [BASE_STAT_HEADERS, ...buildBaseStatRows(data)],
        columnWidths: BASE_STAT_WIDTHS,
      },
    ],
    `data-base-stat-${new Date().toISOString().slice(0, 10)}`,
  );
};

export const downloadBaseStatTemplate = (): void => {
  const exampleRow: (string | number)[] = [
    'Miya', 2480, 0, 0, 7.4, 0, 0, 110, 17, 0, 10, 0.85, 240, 0, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
    120, 0, 0, 0.5, 0, 0, 8, 1.5, 0, 1.2, 0,
  ];

  exportSheetsToExcel(
    [
      {
        name: 'Template Base Stat',
        aoa: [BASE_STAT_HEADERS, exampleRow],
        columnWidths: BASE_STAT_WIDTHS,
      },
      {
        name: 'Petunjuk',
        aoa: [
          ['Petunjuk Pengisian Template Base Stat'],
          [],
          ['1. Sheet "Template Base Stat" berisi 1 baris contoh, hapus baris contoh sebelum mengimpor data baru.'],
          ['2. Kolom "Nama Hero" wajib diisi sama persis dengan nama hero yang sudah ada di Data Hero.'],
          ['3. Setiap hero hanya boleh memiliki 1 baris base stat. Jika sudah ada, baris pada file akan gagal disimpan.'],
          ['4. Semua kolom angka wajib diisi (boleh 0 jika tidak relevan, mis. Energy untuk hero non-energy).'],
          ['5. Gunakan titik sebagai pemisah desimal, contoh 7.4.'],
          ['6. Kolom Growth bersifat opsional, isi dengan angka pertumbuhan per level (boleh 0).'],
        ],
        columnWidths: [120],
      },
    ],
    'template-data-base-stat',
  );
};

export const parseBaseStatFile = async (file: File): Promise<BaseStatImportInput[]> => {
  const rows = await readExcelAsRows<BaseStatImportRow>(file);
  const cleanRows = rows.filter((row) => toStr(row['Nama Hero']).length > 0);

  if (cleanRows.length === 0) {
    throw new Error('File tidak berisi data base stat yang valid (kolom Nama Hero kosong).');
  }

  return cleanRows.map((row) => ({
    heroName: toStr(row['Nama Hero']),
    hp: toNum(row.HP),
    mana: toNum(row.Mana),
    energy: toNum(row.Energy),
    hp_regen: toNum(row['HP Regen']),
    mana_regen: toNum(row['Mana Regen']),
    energy_regen: toNum(row['Energy Regen']),
    physical_attack: toNum(row['Physical Attack']),
    physical_defense: toNum(row['Physical Defense']),
    magic_power: toNum(row['Magic Power']),
    magic_defense: toNum(row['Magic Defense']),
    attack_speed: toNum(row['Attack Speed']),
    movement_speed: toNum(row['Movement Speed']),
    spell_vamp_ratio: toNum(row['Spell Vamp Ratio']),
    attack_range: toNum(row['Attack Range']),
    crit_rate: toNum(row['Crit Rate']),
    crit_damage: toNum(row['Crit Damage']),
    physical_pen: toNum(row['Physical PEN']),
    magical_pen: toNum(row['Magical PEN']),
    lifesteal: toNum(row.Lifesteal),
    resilience: toNum(row.Resilience),
    crit_damage_reduction: toNum(row['Crit Damage Reduction']),
    received_heal: toNum(row['Pemulihan Diterima']),
    hp_growth: toNum(row['HP Growth']),
    mana_growth: toNum(row['Mana Growth']),
    energy_growth: toNum(row['Energy Growth']),
    hp_regen_growth: toNum(row['HP Regen Growth']),
    mana_regen_growth: toNum(row['Mana Regen Growth']),
    energy_regen_growth: toNum(row['Energy Regen Growth']),
    physical_attack_growth: toNum(row['Physical Attack Growth']),
    physical_defense_growth: toNum(row['Physical Defense Growth']),
    magic_power_growth: toNum(row['Magic Power Growth']),
    magic_defense_growth: toNum(row['Magic Defense Growth']),
    attack_speed_growth: toNum(row['Attack Speed Growth']),
  }));
};

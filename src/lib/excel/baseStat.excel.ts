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
  attack_speed_ratio: number;
  spell_vamp_ratio: number;
  attack_range: number;
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
  'Attack Speed Ratio'?: string | number;
  'Spell Vamp Ratio'?: string | number;
  'Attack Range'?: string | number;
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
  'Attack Speed Ratio',
  'Spell Vamp Ratio',
  'Attack Range',
];

const BASE_STAT_WIDTHS = [22, 10, 10, 10, 12, 12, 14, 16, 18, 14, 16, 14, 16, 18, 18, 14];

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
    stat.attack_speed_ratio,
    stat.spell_vamp_ratio,
    stat.attack_range,
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
    'Miya', 2480, 0, 0, 7.4, 0, 0, 110, 17, 0, 10, 0.85, 240, 1.0, 0, 5,
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
    attack_speed_ratio: toNum(row['Attack Speed Ratio']),
    spell_vamp_ratio: toNum(row['Spell Vamp Ratio']),
    attack_range: toNum(row['Attack Range']),
  }));
};

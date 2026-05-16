import type { Hero } from '../../types/Hero';
import { HERO_ROLE_OPTIONS, HERO_TYPE_OPTIONS } from '../../types/Hero';
import { exportSheetsToExcel, readExcelAsRows, toList, toNum, toStr } from '../../utils/excel';

export interface HeroCreateInput {
  name: string;
  alias: string;
  role: string[];
  type: string[];
  speciality: string;
  region: string;
  hero_order: number;
  short_description: string;
  avatar: string;
  image: string;
  release_date: string;
  durability: number;
  offense: number;
  control_effect: number;
  difficulty: number;
}

interface HeroImportRow {
  Nama?: string;
  Alias?: string;
  Role?: string;
  Tipe?: string;
  Spesialitas?: string;
  Region?: string;
  'Hero Order'?: string | number;
  'Deskripsi Singkat'?: string;
  'Avatar URL'?: string;
  'Image URL'?: string;
  'Tanggal Rilis'?: string;
  Durability?: string | number;
  Offense?: string | number;
  'Control Effect'?: string | number;
  Difficulty?: string | number;
}

const HERO_HEADERS = [
  'Nama',
  'Alias',
  'Role',
  'Tipe',
  'Spesialitas',
  'Region',
  'Hero Order',
  'Deskripsi Singkat',
  'Avatar URL',
  'Image URL',
  'Tanggal Rilis',
  'Durability',
  'Offense',
  'Control Effect',
  'Difficulty',
];

const HERO_WIDTHS = [22, 22, 28, 28, 22, 18, 12, 50, 35, 35, 16, 12, 12, 14, 12];

const toArr = (value: string | string[]): string[] => (Array.isArray(value) ? value : value ? [value] : []);

const buildHeroRows = (data: Hero[]) =>
  data.map((hero) => [
    hero.name,
    hero.alias,
    toArr(hero.role).join(', '),
    toArr(hero.type).join(', '),
    hero.speciality,
    hero.region,
    hero.hero_order,
    hero.short_description,
    hero.avatar,
    hero.image,
    hero.release_date,
    hero.durability,
    hero.offense,
    hero.control_effect,
    hero.difficulty,
  ]);

export const exportHeroes = (data: Hero[]): void => {
  exportSheetsToExcel(
    [
      {
        name: 'Data Hero',
        aoa: [HERO_HEADERS, ...buildHeroRows(data)],
        columnWidths: HERO_WIDTHS,
      },
    ],
    `data-hero-${new Date().toISOString().slice(0, 10)}`,
  );
};

export const downloadHeroTemplate = (): void => {
  const exampleRow = [
    'Miya',
    'Moonlight Archer',
    HERO_ROLE_OPTIONS.slice(0, 1).join(', '),
    HERO_TYPE_OPTIONS.filter((t) => t === 'Marksman').join(', '),
    'Reap',
    'Moniyan Empire',
    1,
    'Marksman dengan damage tinggi di late game.',
    'https://example.com/avatar/miya.png',
    'https://example.com/image/miya.png',
    '2016-07-14',
    4,
    8,
    3,
    3,
  ];

  exportSheetsToExcel(
    [
      {
        name: 'Template Hero',
        aoa: [HERO_HEADERS, exampleRow],
        columnWidths: HERO_WIDTHS,
      },
      {
        name: 'Petunjuk',
        aoa: [
          ['Petunjuk Pengisian Template Hero'],
          [],
          ['1. Sheet "Template Hero" berisi 1 baris contoh, hapus baris contoh sebelum mengimpor data baru.'],
          ['2. Kolom Role dan Tipe boleh diisi lebih dari satu, pisahkan dengan koma.'],
          [`3. Pilihan Role yang valid: ${HERO_ROLE_OPTIONS.join(', ')}.`],
          [`4. Pilihan Tipe yang valid: ${HERO_TYPE_OPTIONS.join(', ')}.`],
          ['5. Hero Order, Durability, Offense, Control Effect, dan Difficulty wajib diisi angka.'],
          ['6. Kolom Avatar URL dan Image URL diisi dengan link gambar yang dapat diakses publik.'],
          ['7. Format tanggal rilis bebas, contoh: 2016-07-14.'],
        ],
        columnWidths: [120],
      },
    ],
    'template-data-hero',
  );
};

export const parseHeroFile = async (file: File): Promise<HeroCreateInput[]> => {
  const rows = await readExcelAsRows<HeroImportRow>(file);
  const cleanRows = rows.filter((row) => toStr(row.Nama).length > 0);

  if (cleanRows.length === 0) {
    throw new Error('File tidak berisi data hero yang valid (kolom Nama kosong).');
  }

  return cleanRows.map((row) => ({
    name: toStr(row.Nama),
    alias: toStr(row.Alias),
    role: toList(row.Role),
    type: toList(row.Tipe),
    speciality: toStr(row.Spesialitas),
    region: toStr(row.Region),
    hero_order: toNum(row['Hero Order']),
    short_description: toStr(row['Deskripsi Singkat']),
    avatar: toStr(row['Avatar URL']),
    image: toStr(row['Image URL']),
    release_date: toStr(row['Tanggal Rilis']),
    durability: toNum(row.Durability),
    offense: toNum(row.Offense),
    control_effect: toNum(row['Control Effect']),
    difficulty: toNum(row.Difficulty),
  }));
};

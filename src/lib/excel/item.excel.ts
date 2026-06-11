import type { Item, ItemFormData } from '../../types/Item';
import { ITEM_TYPE_OPTIONS } from '../../types/Item';
import { exportSheetsToExcel, readExcelAsRows, toList, toStr } from '../../utils/excel';

interface ItemImportRow {
  Nama?: string;
  Tipe?: string;
  Tag?: string;
  Tier?: string;
  Atribut?: string;
  Harga?: string | number;
  'Image URL'?: string;
  Cerita?: string;
  Deskripsi?: string;
  Tips?: string;
}

const ITEM_HEADERS = [
  'Nama',
  'Tipe',
  'Tag',
  'Tier',
  'Atribut',
  'Harga',
  'Image URL',
  'Cerita',
  'Deskripsi',
  'Tips',
];

const ITEM_WIDTHS = [24, 16, 22, 10, 36, 12, 36, 50, 60, 50];

const buildItemRows = (items: Item[]) =>
  items.map((item) => [
    item.name,
    item.type,
    item.tag,
    item.tier || '',
    (item.attributes || []).join(', '),
    item.price,
    item.image,
    item.story,
    (item.description || []).join(' | '),
    item.tips,
  ]);

export const exportItems = (items: Item[]): void => {
  exportSheetsToExcel(
    [
      {
        name: 'Data Item',
        aoa: [ITEM_HEADERS, ...buildItemRows(items)],
        columnWidths: ITEM_WIDTHS,
      },
    ],
    `data-item-${new Date().toISOString().slice(0, 10)}`,
  );
};

export const downloadItemTemplate = (): void => {
  const exampleRow = [
    'Demon Hunter Sword',
    'Attack',
    'Attack Speed',
    '3',
    '+35 Physical Attack, +25% Attack Speed',
    '2180',
    'https://example.com/item/demon-hunter-sword.png',
    'Pedang pemburu iblis yang meningkatkan serangan dasar.',
    'Memberikan damage tambahan berdasarkan HP target | Cocok untuk marksman attack speed',
    'Efektif melawan hero dengan HP tinggi.',
  ];

  exportSheetsToExcel(
    [
      {
        name: 'Template Item',
        aoa: [ITEM_HEADERS, exampleRow],
        columnWidths: ITEM_WIDTHS,
      },
      {
        name: 'Petunjuk',
        aoa: [
          ['Petunjuk Pengisian Template Item'],
          [],
          ['1. Sheet "Template Item" berisi 1 baris contoh, hapus atau ubah baris contoh sebelum impor.'],
          [`2. Pilihan Tipe yang valid: ${ITEM_TYPE_OPTIONS.join(', ')}.`],
          ['3. Kolom Tier bersifat opsional, isi dengan angka (contoh: 1, 2, 3).'],
          ['4. Kolom Atribut boleh berisi banyak nilai, pisahkan dengan koma.'],
          ['5. Kolom Deskripsi boleh berisi banyak paragraf, pisahkan dengan tanda |.'],
          ['6. Harga boleh berupa angka atau teks angka, contoh: 2180.'],
        ],
        columnWidths: [120],
      },
    ],
    'template-data-item',
  );
};

export const parseItemFile = async (file: File): Promise<ItemFormData[]> => {
  const rows = await readExcelAsRows<ItemImportRow>(file);
  const cleanRows = rows.filter((row) => toStr(row.Nama).length > 0);

  if (cleanRows.length === 0) {
    throw new Error('File tidak berisi data item yang valid (kolom Nama kosong).');
  }

  return cleanRows.map((row) => ({
    name: toStr(row.Nama),
    type: toStr(row.Tipe),
    tag: toStr(row.Tag),
    tier: toStr(row.Tier),
    attributes: toList(row.Atribut),
    price: toStr(row.Harga),
    image: toStr(row['Image URL']),
    story: toStr(row.Cerita),
    description: toStr(row.Deskripsi)
      .split('|')
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
    tips: toStr(row.Tips),
    parent_items: [],
  }));
};

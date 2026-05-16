import type { Skill, SkillDetail } from '../../types/Skill';
import { SKILL_TAG_OPTIONS, SKILL_TYPE_OPTIONS } from '../../types/Skill';
import { exportSheetsToExcel, readExcelAsAoa, toList, toNum, toStr } from '../../utils/excel';
import type { SheetDefinition, SheetSection } from '../../utils/excel';

export interface SkillRow extends Pick<Skill, '_id' | 'name' | 'type' | 'tag' | 'skill_icon' | 'lite_description' | 'full_description'> {}

export interface HeroSkillsBundle {
  heroId: string;
  heroName: string;
  skills: SkillRow[];
}

export interface ParsedSkill {
  name: string;
  type: string;
  tag: string[];
  skill_icon: string;
  lite_description: string;
  full_description: string;
  details: SkillDetail[];
}

export interface ParsedHeroSheet {
  heroName: string;
  skills: ParsedSkill[];
}

const SKILL_INFO_HEADERS = [
  'Nama Skill',
  'Tipe',
  'Tag',
  'Skill Icon URL',
  'Deskripsi Singkat',
  'Deskripsi Lengkap',
];
const SKILL_INFO_WIDTHS = [22, 14, 28, 35, 50, 60];

const SKILL_DETAIL_HEADERS = ['Nama Skill', 'Level', 'Atribut', 'Nilai'];
const SKILL_DETAIL_WIDTHS = [22, 8, 26, 14];

const toArray = (value: string | string[]): string[] => (Array.isArray(value) ? value : value ? [value] : []);

const buildHeroSheet = (bundle: HeroSkillsBundle, detailsBySkillId: Map<string, SkillDetail[]>): SheetDefinition => {
  const skillInfoRows = bundle.skills.map((skill) => [
    skill.name,
    skill.type,
    toArray(skill.tag).join(', '),
    skill.skill_icon,
    skill.lite_description,
    skill.full_description,
  ]);

  const skillDetailRows: (string | number)[][] = [];
  bundle.skills.forEach((skill) => {
    const details = detailsBySkillId.get(skill._id) ?? [];
    details
      .slice()
      .sort((a, b) => (a.level || 0) - (b.level || 0))
      .forEach((detail) => {
        const attrs = detail.attributes || {};
        const keys = Object.keys(attrs);
        if (keys.length === 0) {
          skillDetailRows.push([skill.name, detail.level, '', '']);
        } else {
          keys.forEach((key) => {
            skillDetailRows.push([skill.name, detail.level, key, attrs[key]]);
          });
        }
      });
  });

  const sections: SheetSection[] = [
    {
      title: `Hero: ${bundle.heroName}`,
      aoa: [['Hero Name', bundle.heroName]],
      columnWidths: [22, 30],
    },
    {
      title: 'Skill Info',
      aoa: [SKILL_INFO_HEADERS, ...skillInfoRows],
      columnWidths: SKILL_INFO_WIDTHS,
    },
    {
      title: 'Skill Detail (long format: 1 baris = 1 atribut per level)',
      aoa: [SKILL_DETAIL_HEADERS, ...skillDetailRows],
      columnWidths: SKILL_DETAIL_WIDTHS,
    },
  ];

  return { name: bundle.heroName || 'Hero', aoa: [], sections };
};

export const exportSkills = (bundles: HeroSkillsBundle[], detailsBySkillId: Map<string, SkillDetail[]>): void => {
  exportSheetsToExcel(
    bundles.map((bundle) => buildHeroSheet(bundle, detailsBySkillId)),
    `data-skill-${new Date().toISOString().slice(0, 10)}`,
  );
};

export const downloadSkillTemplate = (): void => {
  const exampleSkillRows: (string | number)[][] = [
    ['Fission Wave', 'Skill 1', 'Buff, Slow', 'https://example.com/icon/fission-wave.png', 'Menembakkan gelombang energi yang memantul.', 'Memantul ke unit terdekat. Damage: {{Damage}}, Slow: {{Slow}}%.'],
    ['Hidden Moonlight', 'Skill 2', 'Conceal', 'https://example.com/icon/hidden-moonlight.png', 'Menjadi tidak terlihat sementara.', 'Bertahan {{Durasi}} detik dan menambah movement speed sebesar {{MS}}%.'],
    ["Goddess's Arrow", 'Ultimate', 'Burst Damage', 'https://example.com/icon/goddess-arrow.png', 'Memanah dari kejauhan dengan damage besar.', 'Damage: {{Damage}}, slow {{Slow}}% selama {{Durasi}} detik.'],
  ];
  const exampleDetailRows: (string | number)[][] = [];
  exampleSkillRows.forEach((row) => {
    const skillName = String(row[0]);
    [1, 2, 3, 4, 5].forEach((level) => {
      exampleDetailRows.push([skillName, level, 'Damage', 100 + level * 25]);
      exampleDetailRows.push([skillName, level, 'Cooldown', 12 - level]);
    });
  });

  exportSheetsToExcel(
    [
      {
        name: 'Miya',
        aoa: [],
        sections: [
          { title: 'Hero: Miya', aoa: [['Hero Name', 'Miya']], columnWidths: [22, 30] },
          { title: 'Skill Info', aoa: [SKILL_INFO_HEADERS, ...exampleSkillRows], columnWidths: SKILL_INFO_WIDTHS },
          { title: 'Skill Detail (long format: 1 baris = 1 atribut per level)', aoa: [SKILL_DETAIL_HEADERS, ...exampleDetailRows], columnWidths: SKILL_DETAIL_WIDTHS },
        ],
      },
      {
        name: 'Petunjuk',
        aoa: [
          ['Petunjuk Pengisian Template Data Skill'],
          [],
          ['1. Setiap hero menempati 1 sheet. Nama sheet = nama hero (harus sama persis dengan nama hero pada Data Hero).'],
          ['2. Sheet wajib memiliki 3 bagian dengan urutan: "Hero Name", "Skill Info", lalu "Skill Detail".'],
          ['3. Bagian "Skill Info": 1 baris per skill. Kolom Tag boleh diisi banyak nilai dipisahkan koma.'],
          [`4. Pilihan Tipe yang valid: ${SKILL_TYPE_OPTIONS.join(', ')}.`],
          [`5. Pilihan Tag yang valid: ${SKILL_TAG_OPTIONS.join(', ')}.`],
          ['6. Bagian "Skill Detail" memakai format panjang: setiap baris berisi 1 atribut untuk 1 level.'],
          ['7. Skill bertipe "Passive" boleh dilewati di bagian Skill Detail.'],
          ['8. Untuk menambah hero, salin sheet "Miya" lalu ganti nama sheet dan isi datanya.'],
          ['9. Field deskripsi mendukung placeholder seperti {{Damage}}, {{Cooldown}}, dll.'],
        ],
        columnWidths: [120],
      },
    ],
    'template-data-skill',
  );
};

const findSectionStart = (rows: (string | number | null)[][], keyword: string): number =>
  rows.findIndex((row) => toStr(row?.[0]).toLowerCase().startsWith(keyword.toLowerCase()));

const isHeaderRow = (row: (string | number | null)[], expected: string[]): boolean =>
  expected.every((header, index) => toStr(row?.[index]).toLowerCase() === header.toLowerCase());

const parseHeroSheet = (sheetName: string, rows: (string | number | null)[][]): ParsedHeroSheet | null => {
  const skillInfoStart = findSectionStart(rows, 'Skill Info');
  const skillDetailStart = findSectionStart(rows, 'Skill Detail');
  if (skillInfoStart < 0) return null;

  const infoEnd = skillDetailStart > 0 ? skillDetailStart : rows.length;
  const skillInfoRows = rows.slice(skillInfoStart + 1, infoEnd);
  const headerIdx = skillInfoRows.findIndex((row) => isHeaderRow(row, SKILL_INFO_HEADERS));
  if (headerIdx < 0) return null;

  const skillsMap = new Map<string, ParsedSkill>();
  skillInfoRows
    .slice(headerIdx + 1)
    .filter((row) => toStr(row?.[0]).length > 0)
    .forEach((row) => {
      const name = toStr(row[0]);
      skillsMap.set(name, {
        name,
        type: toStr(row[1]),
        tag: toList(row[2]),
        skill_icon: toStr(row[3]),
        lite_description: toStr(row[4]),
        full_description: toStr(row[5]),
        details: [],
      });
    });

  if (skillDetailStart >= 0) {
    const detailRows = rows.slice(skillDetailStart + 1);
    const detailHeaderIdx = detailRows.findIndex((row) => isHeaderRow(row, SKILL_DETAIL_HEADERS));
    if (detailHeaderIdx >= 0) {
      const grouped = new Map<string, Map<number, Record<string, number>>>();
      detailRows
        .slice(detailHeaderIdx + 1)
        .filter((row) => toStr(row?.[0]).length > 0 && toStr(row?.[1]).length > 0)
        .forEach((row) => {
          const skillName = toStr(row[0]);
          const level = toNum(row[1]);
          const attr = toStr(row[2]);
          const value = toNum(row[3]);
          if (!skillName || !level) return;
          if (!grouped.has(skillName)) grouped.set(skillName, new Map());
          const levelMap = grouped.get(skillName);
          if (!levelMap) return;
          if (!levelMap.has(level)) levelMap.set(level, {});
          const attrs = levelMap.get(level);
          if (attr && attrs) attrs[attr] = value;
        });

      grouped.forEach((levelMap, skillName) => {
        const skill = skillsMap.get(skillName);
        if (!skill) return;
        skill.details = Array.from(levelMap.entries())
          .map(([level, attributes]) => ({ level, attributes }))
          .sort((a, b) => a.level - b.level);
      });
    }
  }

  return { heroName: sheetName, skills: Array.from(skillsMap.values()) };
};

export const parseSkillFile = async (file: File): Promise<ParsedHeroSheet[]> => {
  const sheetMap = await readExcelAsAoa(file);
  const parsed = Object.entries(sheetMap)
    .filter(([name]) => !['Petunjuk', 'Instructions', 'Guide'].includes(name))
    .map(([sheetName, rows]) => parseHeroSheet(sheetName, rows))
    .filter((sheet): sheet is ParsedHeroSheet => Boolean(sheet && sheet.skills.length > 0));

  if (parsed.length === 0) {
    throw new Error('Tidak ada data skill yang valid pada file. Pastikan struktur sheet sesuai template.');
  }

  return parsed;
};

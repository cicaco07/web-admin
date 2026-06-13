import type { Skill, SkillDetail } from '../../types/Skill';
import { SKILL_TAG_OPTIONS, SKILL_TYPE_OPTIONS } from '../../types/Skill';
import { exportStyledSheetsToExcel, readExcelAsAoa, toList, toNum, toStr } from '../../utils/excel';
import type { StyledCell, StyledSheetDefinition, CellStyle } from '../../utils/excel';
import type { Range } from 'xlsx-js-style';

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

const toArray = (value: string | string[]): string[] => (Array.isArray(value) ? value : value ? [value] : []);

const COLORS = {
  heroHeader: '1B3A5C',
  heroHeaderFont: 'FFFFFF',
  sectionTitle: '2E7D32',
  sectionTitleFont: 'FFFFFF',
  label: 'E3F2FD',
  labelFont: '1565C0',
  tableHeader: '37474F',
  tableHeaderFont: 'FFFFFF',
  tableRowEven: 'F5F5F5',
  tableRowOdd: 'FFFFFF',
  skillSeparator: 'FFF3E0',
  skillSeparatorFont: 'E65100',
  border: 'BDBDBD',
};

const BORDER_THIN: CellStyle['border'] = {
  top: { style: 'thin', color: { rgb: COLORS.border } },
  bottom: { style: 'thin', color: { rgb: COLORS.border } },
  left: { style: 'thin', color: { rgb: COLORS.border } },
  right: { style: 'thin', color: { rgb: COLORS.border } },
};

const cell = (v: string | number | null | undefined, style?: CellStyle): StyledCell => ({ v, s: style });

const heroHeaderStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.heroHeaderFont }, sz: 14 },
  fill: { fgColor: { rgb: COLORS.heroHeader } },
  alignment: { horizontal: 'center', vertical: 'center' },
};

const sectionTitleStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.sectionTitleFont }, sz: 11 },
  fill: { fgColor: { rgb: COLORS.sectionTitle } },
  alignment: { vertical: 'center' },
  border: BORDER_THIN,
};

const labelStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.labelFont } },
  fill: { fgColor: { rgb: COLORS.label } },
  alignment: { vertical: 'center' },
  border: BORDER_THIN,
};

const valueStyle: CellStyle = {
  alignment: { vertical: 'center', wrapText: true },
  border: BORDER_THIN,
};

const tableHeaderStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.tableHeaderFont }, sz: 10 },
  fill: { fgColor: { rgb: COLORS.tableHeader } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: BORDER_THIN,
};

const tableEvenStyle: CellStyle = {
  fill: { fgColor: { rgb: COLORS.tableRowEven } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: BORDER_THIN,
};

const tableOddStyle: CellStyle = {
  fill: { fgColor: { rgb: COLORS.tableRowOdd } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: BORDER_THIN,
};

const skillNameStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.skillSeparatorFont }, sz: 11 },
  fill: { fgColor: { rgb: COLORS.skillSeparator } },
  alignment: { vertical: 'center' },
  border: BORDER_THIN,
};

const attrLabelStyle: CellStyle = {
  font: { bold: true },
  fill: { fgColor: { rgb: COLORS.label } },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: BORDER_THIN,
};

const buildStyledHeroSheet = (bundle: HeroSkillsBundle, detailsBySkillId: Map<string, SkillDetail[]>): StyledSheetDefinition => {
  const data: StyledCell[][] = [];
  const merges: Range[] = [];
  const maxLevels = 6;
  const totalCols = 2 + maxLevels;

  const emptyRow = (): StyledCell[] => Array.from({ length: totalCols }, () => cell(''));
  const fillRow = (row: StyledCell[], cols: number): StyledCell[] => {
    while (row.length < cols) row.push(cell(''));
    return row;
  };

  // Hero Header
  const heroRow: StyledCell[] = Array.from({ length: totalCols }, () => cell('', heroHeaderStyle));
  heroRow[0] = cell(`Hero: ${bundle.heroName}`, heroHeaderStyle);
  data.push(heroRow);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  data.push(emptyRow());

  bundle.skills.forEach((skill, skillIdx) => {
    const details = (detailsBySkillId.get(skill._id) ?? []).slice().sort((a, b) => (a.level || 0) - (b.level || 0));
    const levelCount = details.length || 0;
    const attributeKeys = details.length > 0 ? Object.keys(details[0]?.attributes || {}) : [];

    // Skill Name Header
    const skillHeaderRow: StyledCell[] = Array.from({ length: totalCols }, () => cell('', skillNameStyle));
    skillHeaderRow[0] = cell(`${skillIdx + 1}. ${skill.name}`, skillNameStyle);
    data.push(skillHeaderRow);
    merges.push({ s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: totalCols - 1 } });

    // Skill Info Section
    const infoTitle: StyledCell[] = Array.from({ length: totalCols }, () => cell('', sectionTitleStyle));
    infoTitle[0] = cell('Informasi Skill', sectionTitleStyle);
    data.push(infoTitle);
    merges.push({ s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: totalCols - 1 } });

    const infoFields: [string, string][] = [
      ['Nama Skill', skill.name],
      ['Tipe', skill.type],
      ['Tag', toArray(skill.tag).join(', ')],
      ['Skill Icon URL', skill.skill_icon],
      ['Deskripsi Singkat', skill.lite_description],
      ['Deskripsi Lengkap', skill.full_description],
    ];

    infoFields.forEach(([label, value]) => {
      const row: StyledCell[] = [cell(label, labelStyle), cell(value, valueStyle)];
      fillRow(row, totalCols);
      data.push(row);
      merges.push({ s: { r: data.length - 1, c: 1 }, e: { r: data.length - 1, c: totalCols - 1 } });
    });

    // Skill Detail Section (horizontal table like website)
    if (levelCount > 0 && attributeKeys.length > 0) {
      data.push(emptyRow());

      const detailTitle: StyledCell[] = Array.from({ length: totalCols }, () => cell('', sectionTitleStyle));
      detailTitle[0] = cell('Skill Detail (Per Level)', sectionTitleStyle);
      data.push(detailTitle);
      merges.push({ s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: totalCols - 1 } });

      // Table Header: Atribut | Level 1 | Level 2 | ...
      const headerRow: StyledCell[] = [cell('Atribut', tableHeaderStyle)];
      for (let lvl = 1; lvl <= levelCount; lvl++) {
        headerRow.push(cell(`Level ${lvl}`, tableHeaderStyle));
      }
      fillRow(headerRow, totalCols);
      data.push(headerRow);

      // Table Body: each attribute as a row
      attributeKeys.forEach((key, attrIdx) => {
        const rowStyle = attrIdx % 2 === 0 ? tableEvenStyle : tableOddStyle;
        const row: StyledCell[] = [cell(key, attrLabelStyle)];
        details.forEach((detail) => {
          const val = detail.attributes?.[key];
          row.push(cell(val !== undefined ? val : '', rowStyle));
        });
        fillRow(row, totalCols);
        data.push(row);
      });
    } else if (skill.type !== 'Passive') {
      data.push(emptyRow());
      const noDetail: StyledCell[] = [cell('(Belum ada data detail)', { font: { color: { rgb: '9E9E9E' } }, alignment: { horizontal: 'center' } })];
      fillRow(noDetail, totalCols);
      data.push(noDetail);
      merges.push({ s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: totalCols - 1 } });
    }

    // Separator between skills
    if (skillIdx < bundle.skills.length - 1) {
      data.push(emptyRow());
    }
  });

  const columnWidths = [20, 18, ...Array.from({ length: maxLevels }, () => 12)];

  return {
    name: bundle.heroName || 'Hero',
    data,
    columnWidths,
    merges,
  };
};

export const exportSkills = (bundles: HeroSkillsBundle[], detailsBySkillId: Map<string, SkillDetail[]>): void => {
  const sheets = bundles.map((bundle) => buildStyledHeroSheet(bundle, detailsBySkillId));
  exportStyledSheetsToExcel(
    sheets,
    `data-skill-${new Date().toISOString().slice(0, 10)}`,
  );
};

export const downloadSkillTemplate = (): void => {
  const exampleDetails: SkillDetail[] = [
    { level: 1, attributes: { Damage: 125, Slow: 30, Cooldown: 12 } },
    { level: 2, attributes: { Damage: 150, Slow: 34, Cooldown: 11 } },
    { level: 3, attributes: { Damage: 175, Slow: 38, Cooldown: 10 } },
    { level: 4, attributes: { Damage: 200, Slow: 42, Cooldown: 9 } },
    { level: 5, attributes: { Damage: 225, Slow: 46, Cooldown: 8 } },
    { level: 6, attributes: { Damage: 250, Slow: 50, Cooldown: 7 } },
  ];

  const exampleDetails2: SkillDetail[] = [
    { level: 1, attributes: { Durasi: 1.5, MS: 25 } },
    { level: 2, attributes: { Durasi: 1.8, MS: 30 } },
    { level: 3, attributes: { Durasi: 2.1, MS: 35 } },
    { level: 4, attributes: { Durasi: 2.4, MS: 40 } },
    { level: 5, attributes: { Durasi: 2.7, MS: 45 } },
    { level: 6, attributes: { Durasi: 3.0, MS: 50 } },
  ];

  const exampleDetails3: SkillDetail[] = [
    { level: 1, attributes: { Damage: 400, Slow: 50, Durasi: 2 } },
    { level: 2, attributes: { Damage: 550, Slow: 55, Durasi: 2.5 } },
    { level: 3, attributes: { Damage: 700, Slow: 60, Durasi: 3 } },
  ];

  const exampleSkills: SkillRow[] = [
    { _id: 's1', name: 'Fission Wave', type: 'Skill 1', tag: ['Buff', 'Slow'], skill_icon: 'https://example.com/icon/fission-wave.png', lite_description: 'Menembakkan gelombang energi yang memantul.', full_description: 'Memantul ke unit terdekat. Damage: {{Damage}}, Slow: {{Slow}}%. Cooldown: {{Cooldown}} detik.' },
    { _id: 's2', name: 'Hidden Moonlight', type: 'Skill 2', tag: ['Conceal'], skill_icon: 'https://example.com/icon/hidden-moonlight.png', lite_description: 'Menjadi tidak terlihat sementara.', full_description: 'Bertahan {{Durasi}} detik dan menambah movement speed sebesar {{MS}}%.' },
    { _id: 's3', name: "Goddess's Arrow", type: 'Ultimate', tag: ['Burst Damage'], skill_icon: 'https://example.com/icon/goddess-arrow.png', lite_description: 'Memanah dari kejauhan dengan damage besar.', full_description: 'Damage: {{Damage}}, slow {{Slow}}% selama {{Durasi}} detik.' },
  ];

  const detailMap = new Map<string, SkillDetail[]>();
  detailMap.set('s1', exampleDetails);
  detailMap.set('s2', exampleDetails2);
  detailMap.set('s3', exampleDetails3);

  const bundle: HeroSkillsBundle = {
    heroId: 'h1',
    heroName: 'Miya',
    skills: exampleSkills,
  };

  const templateSheet = buildStyledHeroSheet(bundle, detailMap);

  // Petunjuk sheet (plain)
  const petunjukData: StyledCell[][] = [
    [cell('Petunjuk Pengisian Template Data Skill', { font: { bold: true, sz: 14, color: { rgb: COLORS.heroHeader } } })],
    [cell('')],
    [cell('1. Setiap hero menempati 1 sheet. Nama sheet = nama hero (harus sama persis dengan nama hero pada Data Hero).')],
    [cell('2. Setiap skill memiliki bagian "Informasi Skill" dan "Skill Detail (Per Level)".')],
    [cell('3. Bagian "Informasi Skill" berisi label-value: Nama Skill, Tipe, Tag, Skill Icon URL, Deskripsi Singkat, Deskripsi Lengkap.')],
    [cell(`4. Pilihan Tipe yang valid: ${SKILL_TYPE_OPTIONS.join(', ')}.`)],
    [cell(`5. Pilihan Tag yang valid: ${SKILL_TAG_OPTIONS.join(', ')}. Pisahkan dengan koma jika lebih dari satu.`)],
    [cell('6. Bagian "Skill Detail" menggunakan format tabel horizontal: baris = atribut, kolom = level.')],
    [cell('7. Skill bertipe "Passive" tidak memerlukan data detail.')],
    [cell('8. Untuk menambah hero, salin sheet contoh lalu ganti nama sheet dan isi datanya.')],
    [cell('9. Field deskripsi mendukung placeholder seperti {{Damage}}, {{Cooldown}}, dll. Nama harus sama persis dengan nama atribut di tabel detail.')],
    [cell('')],
    [cell('Format Tabel Detail:', { font: { bold: true } })],
    [cell('  Atribut    | Level 1 | Level 2 | Level 3 | ...')],
    [cell('  Damage     | 100     | 125     | 150     | ...')],
    [cell('  Cooldown   | 12      | 11      | 10      | ...')],
  ];

  const petunjukSheet: StyledSheetDefinition = {
    name: 'Petunjuk',
    data: petunjukData,
    columnWidths: [120],
  };

  exportStyledSheetsToExcel([templateSheet, petunjukSheet], 'template-data-skill');
};

// ==================== IMPORT (PARSING) ====================

const SKILL_INFO_LABELS = ['Nama Skill', 'Tipe', 'Tag', 'Skill Icon URL', 'Deskripsi Singkat', 'Deskripsi Lengkap'];

const parseHeroSheet = (sheetName: string, rows: (string | number | null)[][]): ParsedHeroSheet | null => {
  const skillsMap = new Map<string, ParsedSkill>();
  let i = 0;

  while (i < rows.length) {
    const cellVal = toStr(rows[i]?.[0]);

    if (cellVal.toLowerCase() === 'nama skill') {
      const nameVal = toStr(rows[i]?.[1]);
      if (nameVal) {
        const skill: ParsedSkill = {
          name: '',
          type: '',
          tag: [],
          skill_icon: '',
          lite_description: '',
          full_description: '',
          details: [],
        };

        let j = i;
        while (j < rows.length && j < i + SKILL_INFO_LABELS.length) {
          const label = toStr(rows[j]?.[0]).toLowerCase();
          const value = toStr(rows[j]?.[1]);
          if (label === 'nama skill') skill.name = value;
          else if (label === 'tipe') skill.type = value;
          else if (label === 'tag') skill.tag = toList(value);
          else if (label.includes('icon')) skill.skill_icon = value;
          else if (label.includes('singkat')) skill.lite_description = value;
          else if (label.includes('lengkap')) skill.full_description = value;
          j++;
        }

        if (skill.name) {
          skillsMap.set(skill.name, skill);
        }
        i = j;
        continue;
      }
    }

    if (cellVal.toLowerCase() === 'atribut') {
      const levels: number[] = [];
      for (let c = 1; c < (rows[i]?.length || 0); c++) {
        const hdr = toStr(rows[i]?.[c]);
        const match = hdr.match(/\d+/);
        if (match) levels.push(parseInt(match[0]));
      }

      if (levels.length > 0) {
        const lastSkill = Array.from(skillsMap.values()).pop();
        if (lastSkill) {
          let j = i + 1;
          while (j < rows.length) {
            const attrName = toStr(rows[j]?.[0]);
            if (!attrName) break;
            if (SKILL_INFO_LABELS.some(l => l.toLowerCase() === attrName.toLowerCase())) break;
            if (attrName.toLowerCase() === 'atribut') break;
            if (attrName.toLowerCase().includes('informasi skill')) break;
            if (attrName.toLowerCase().includes('skill detail')) break;
            if (/^\d+\./.test(attrName)) break;

            levels.forEach((level, colIdx) => {
              const val = toNum(rows[j]?.[colIdx + 1]);
              let detail = lastSkill.details.find(d => d.level === level);
              if (!detail) {
                detail = { level, attributes: {} };
                lastSkill.details.push(detail);
              }
              detail.attributes[attrName] = val;
            });
            j++;
          }
          lastSkill.details.sort((a, b) => a.level - b.level);
          i = j;
          continue;
        }
      }
    }

    i++;
  }

  // Fallback: try old format parsing
  if (skillsMap.size === 0) {
    return parseHeroSheetLegacy(sheetName, rows);
  }

  return skillsMap.size > 0 ? { heroName: sheetName, skills: Array.from(skillsMap.values()) } : null;
};

// Legacy parser for old format compatibility
const SKILL_INFO_HEADERS_LEGACY = ['Nama Skill', 'Tipe', 'Tag', 'Skill Icon URL', 'Deskripsi Singkat', 'Deskripsi Lengkap'];
const SKILL_DETAIL_HEADERS_LEGACY = ['Nama Skill', 'Level', 'Atribut', 'Nilai'];

const isHeaderRow = (row: (string | number | null)[], expected: string[]): boolean =>
  expected.every((header, index) => toStr(row?.[index]).toLowerCase() === header.toLowerCase());

const parseHeroSheetLegacy = (sheetName: string, rows: (string | number | null)[][]): ParsedHeroSheet | null => {
  const skillInfoStart = rows.findIndex((row) => toStr(row?.[0]).toLowerCase().startsWith('skill info'));
  const skillDetailStart = rows.findIndex((row) => toStr(row?.[0]).toLowerCase().startsWith('skill detail'));
  if (skillInfoStart < 0) return null;

  const infoEnd = skillDetailStart > 0 ? skillDetailStart : rows.length;
  const skillInfoRows = rows.slice(skillInfoStart + 1, infoEnd);
  const headerIdx = skillInfoRows.findIndex((row) => isHeaderRow(row, SKILL_INFO_HEADERS_LEGACY));
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
    const detailHeaderIdx = detailRows.findIndex((row) => isHeaderRow(row, SKILL_DETAIL_HEADERS_LEGACY));
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

  return skillsMap.size > 0 ? { heroName: sheetName, skills: Array.from(skillsMap.values()) } : null;
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

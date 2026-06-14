import type { BaseStat } from '../../types/BaseStat';
import { BASE_STAT_FIELD_GROUPS } from '../../types/BaseStat';
import { exportStyledSheetsToExcel, toNum, toStr } from '../../utils/excel';
import type { StyledCell, StyledSheetDefinition, CellStyle } from '../../utils/excel';
import XLSX from 'xlsx-js-style';
import type { Range } from 'xlsx-js-style';

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

const COLORS = {
  heroHeader: '1B3A5C',
  heroHeaderFont: 'FFFFFF',
  groupVitality: 'C62828',
  groupOffense: 'F57F17',
  groupDefense: '1565C0',
  groupMobility: '2E7D32',
  groupFont: 'FFFFFF',
  label: 'E3F2FD',
  labelFont: '1565C0',
  tableHeader: '37474F',
  tableHeaderFont: 'FFFFFF',
  tableRowEven: 'F5F5F5',
  tableRowOdd: 'FFFFFF',
  growthSection: '4A148C',
  growthSectionFont: 'FFFFFF',
  border: 'BDBDBD',
};

const BORDER_THIN: CellStyle['border'] = {
  top: { style: 'thin', color: { rgb: COLORS.border } },
  bottom: { style: 'thin', color: { rgb: COLORS.border } },
  left: { style: 'thin', color: { rgb: COLORS.border } },
  right: { style: 'thin', color: { rgb: COLORS.border } },
};

const cell = (v: string | number | null | undefined, style?: CellStyle): StyledCell => ({ v, s: style });
const formulaCell = (f: string, style?: CellStyle): StyledCell => ({ v: null, f, s: style });

const heroHeaderStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.heroHeaderFont }, sz: 14 },
  fill: { fgColor: { rgb: COLORS.heroHeader } },
  alignment: { horizontal: 'center', vertical: 'center' },
};

const valueStyle: CellStyle = {
  alignment: { horizontal: 'center', vertical: 'center' },
  border: BORDER_THIN,
};

const tableHeaderStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.tableHeaderFont }, sz: 10 },
  fill: { fgColor: { rgb: COLORS.tableHeader } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: BORDER_THIN,
};

const growthSectionStyle: CellStyle = {
  font: { bold: true, color: { rgb: COLORS.growthSectionFont }, sz: 11 },
  fill: { fgColor: { rgb: COLORS.growthSection } },
  alignment: { vertical: 'center' },
  border: BORDER_THIN,
};

const TOTAL_COLS = 17;

const buildStyledHeroSheet = (stat: BaseStat): StyledSheetDefinition => {
  const data: StyledCell[][] = [];
  const merges: Range[] = [];

  const emptyRow = (): StyledCell[] => Array.from({ length: TOTAL_COLS }, () => cell(''));

  const inputStyle: CellStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'FFFDE7' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
  };

  const formulaStyle: CellStyle = {
    fill: { fgColor: { rgb: 'E8F5E9' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
  };

  const growthFormulaStyle: CellStyle = {
    font: { bold: true, color: { rgb: '4A148C' } },
    fill: { fgColor: { rgb: 'F3E5F5' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
  };

  // Hero Header
  const heroRow: StyledCell[] = Array.from({ length: TOTAL_COLS }, () => cell('', heroHeaderStyle));
  heroRow[0] = cell(`${stat.hero.name}`, heroHeaderStyle);
  data.push(heroRow);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: TOTAL_COLS - 1 } });

  data.push(emptyRow());

  // Stat Growth Per Level section (main table with formulas)
  // Layout: Stat | Lv1 (input) | Lv15 (input) | Growth (formula) | Lv2 | Lv3 | ... | Lv14
  // Columns: 0=Stat, 1=Lv1, 2=Lv15, 3=Growth, 4=Lv2, 5=Lv3, ..., 16=Lv14

  const growthFields = BASE_STAT_FIELD_GROUPS
    .flatMap((g) => g.fields)
    .filter((f) => f.growthKey);

  // Section title
  const sectionRow: StyledCell[] = Array.from({ length: TOTAL_COLS }, () => cell('', growthSectionStyle));
  sectionRow[0] = cell('Stat Per Level (Input Lv 1 & Lv 15, lainnya otomatis)', growthSectionStyle);
  data.push(sectionRow);
  merges.push({ s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: TOTAL_COLS - 1 } });

  // Header row
  const inputHeaderStyle: CellStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    fill: { fgColor: { rgb: 'E65100' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
  };
  const growthHeaderStyle: CellStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    fill: { fgColor: { rgb: '4A148C' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
  };
  const calcHeaderStyle: CellStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    fill: { fgColor: { rgb: '1B5E20' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
  };

  const headerRow: StyledCell[] = [
    cell('Stat', tableHeaderStyle),
    cell('Lv 1 ✏️', inputHeaderStyle),
    cell('Lv 15 ✏️', inputHeaderStyle),
    cell('Growth', growthHeaderStyle),
  ];
  for (let lvl = 2; lvl <= 14; lvl++) {
    headerRow.push(cell(`Lv ${lvl}`, calcHeaderStyle));
  }
  data.push(headerRow);

  // Data rows with formulas
  const dataStartRow = data.length;
  growthFields.forEach((field, idx) => {
    const baseVal = (stat as any)[field.key] ?? 0;
    const growthVal = field.growthKey ? ((stat as any)[field.growthKey] ?? 0) : 0;
    const lv15Val = Math.round((baseVal + growthVal * 14) * 100) / 100;

    const currentRow = dataStartRow + idx;
    const rowNum = currentRow + 1;

    const rowLabelStyle: CellStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: idx % 2 === 0 ? COLORS.tableRowEven : COLORS.tableRowOdd } },
      alignment: { vertical: 'center' },
      border: BORDER_THIN,
    };
    const rowCalcStyle = idx % 2 === 0
      ? { ...formulaStyle, fill: { fgColor: { rgb: COLORS.tableRowEven } } }
      : { ...formulaStyle, fill: { fgColor: { rgb: COLORS.tableRowOdd } } };

    // Col A=Stat, B=Lv1(input), C=Lv15(input), D=Growth(formula), E-Q=Lv2-Lv14(formula)
    const row: StyledCell[] = [
      cell(field.label, rowLabelStyle),
      cell(baseVal, inputStyle),
      cell(lv15Val, inputStyle),
      formulaCell(`ROUND((C${rowNum}-B${rowNum})/14,4)`, growthFormulaStyle),
    ];

    // Lv 2 to Lv 14 (columns E to Q)
    for (let lvl = 2; lvl <= 14; lvl++) {
      // formula: =ROUND(B{row} + D{row} * (lvl-1), 2)
      row.push(formulaCell(`ROUND(B${rowNum}+D${rowNum}*${lvl - 1},2)`, rowCalcStyle));
    }

    data.push(row);
  });

  data.push(emptyRow());

  // Non-growth stats section (stats without growth)
  const nonGrowthFields = BASE_STAT_FIELD_GROUPS
    .flatMap((g) => g.fields)
    .filter((f) => !f.growthKey);

  if (nonGrowthFields.length > 0) {
    const nonGrowthTitle: StyledCell[] = Array.from({ length: TOTAL_COLS }, () => cell('', {
      font: { bold: true, color: { rgb: COLORS.groupFont }, sz: 11 },
      fill: { fgColor: { rgb: COLORS.groupOffense } },
      alignment: { vertical: 'center' },
      border: BORDER_THIN,
    }));
    nonGrowthTitle[0] = cell('Stat Tetap (Tidak Ada Growth)', {
      font: { bold: true, color: { rgb: COLORS.groupFont }, sz: 11 },
      fill: { fgColor: { rgb: COLORS.groupOffense } },
      alignment: { vertical: 'center' },
      border: BORDER_THIN,
    });
    data.push(nonGrowthTitle);
    merges.push({ s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: TOTAL_COLS - 1 } });

    // Header
    data.push([
      cell('Stat', tableHeaderStyle),
      cell('Value', tableHeaderStyle),
      ...Array.from({ length: TOTAL_COLS - 2 }, () => cell('', tableHeaderStyle)),
    ]);

    nonGrowthFields.forEach((field, idx) => {
      const val = (stat as any)[field.key] ?? 0;
      const rowStyle = idx % 2 === 0
        ? { ...valueStyle, fill: { fgColor: { rgb: COLORS.tableRowEven } } }
        : { ...valueStyle, fill: { fgColor: { rgb: COLORS.tableRowOdd } } };

      const row: StyledCell[] = [
        cell(field.label, { font: { bold: true }, fill: { fgColor: { rgb: idx % 2 === 0 ? COLORS.tableRowEven : COLORS.tableRowOdd } }, alignment: { vertical: 'center' }, border: BORDER_THIN }),
        cell(val, inputStyle),
        ...Array.from({ length: TOTAL_COLS - 2 }, () => cell('', rowStyle)),
      ];
      data.push(row);
    });
  }

  const columnWidths = [22, 12, 12, 12, ...Array.from({ length: 13 }, () => 10)];

  return {
    name: stat.hero.name || 'Hero',
    data,
    columnWidths,
    merges,
  };
};

export const exportBaseStats = (data: BaseStat[]): void => {
  const sheets = data.map((stat) => buildStyledHeroSheet(stat));
  exportStyledSheetsToExcel(
    sheets,
    `data-base-stat-${new Date().toISOString().slice(0, 10)}`,
  );
};

export const downloadBaseStatTemplate = (): void => {
  const exampleStat: BaseStat = {
    _id: '',
    hero: { _id: '', name: 'Miya', image: '', role: ['Marksman'] },
    hp: 2480, mana: 0, energy: 0,
    hp_regen: 7.4, mana_regen: 0, energy_regen: 0,
    physical_attack: 110, physical_defense: 17,
    magic_power: 0, magic_defense: 10,
    attack_speed: 0.85, movement_speed: 240,
    spell_vamp_ratio: 0, attack_range: 5,
    crit_rate: 0, crit_damage: 0,
    physical_pen: 0, magical_pen: 0,
    lifesteal: 0, resilience: 0,
    crit_damage_reduction: 0, received_heal: 0,
    hp_growth: 120, mana_growth: 0, energy_growth: 0,
    hp_regen_growth: 0.5, mana_regen_growth: 0, energy_regen_growth: 0,
    physical_attack_growth: 8, physical_defense_growth: 1.5,
    magic_power_growth: 0, magic_defense_growth: 1.2,
    attack_speed_growth: 0,
  };

  const templateSheet = buildStyledHeroSheet(exampleStat);

  const petunjukData: StyledCell[][] = [
    [cell('Petunjuk Pengisian Template Base Stat', { font: { bold: true, sz: 14, color: { rgb: COLORS.heroHeader } } })],
    [cell('')],
    [cell('1. Setiap hero menempati 1 sheet. Nama sheet = nama hero (harus sama persis dengan nama hero pada Data Hero).')],
    [cell('2. User hanya perlu mengisi kolom "Lv 1" dan "Lv 15" (ditandai ✏️ pada header).')],
    [cell('3. Kolom "Growth" dan "Lv 2 - Lv 14" akan otomatis terhitung menggunakan rumus Excel.')],
    [cell('4. Rumus: Growth = (Lv15 - Lv1) / 14, kemudian Lv N = Lv1 + Growth × (N-1).')],
    [cell('5. Semua kolom angka wajib diisi (boleh 0 jika tidak relevan, mis. Energy untuk hero non-energy).')],
    [cell('6. Gunakan titik sebagai pemisah desimal, contoh: 7.4')],
    [cell('7. Bagian "Stat Tetap" adalah stat yang tidak memiliki growth (nilainya sama di semua level).')],
    [cell('8. Untuk menambah hero baru, salin sheet contoh lalu ganti nama sheet dan isi datanya.')],
    [cell('')],
    [cell('Keterangan Warna:', { font: { bold: true } })],
    [cell('  🟡 Kuning muda = Kolom yang perlu diisi manual (Lv 1 & Lv 15)')],
    [cell('  🟢 Hijau muda = Kolom otomatis (Lv 2-14, dihitung dari formula)')],
    [cell('  🟣 Ungu muda = Growth per level (dihitung otomatis)')],
    [cell('')],
    [cell('Format Import Lama (tetap didukung):', { font: { bold: true } })],
    [cell('  File juga bisa menggunakan format tabel lama (1 baris per hero dengan semua kolom).')],
  ];

  const petunjukSheet: StyledSheetDefinition = {
    name: 'Petunjuk',
    data: petunjukData,
    columnWidths: [120],
  };

  exportStyledSheetsToExcel([templateSheet, petunjukSheet], 'template-data-base-stat');
};

// ==================== IMPORT (PARSING) ====================

const parseHeroSheetNew = (sheetName: string, rows: (string | number | null)[][]): BaseStatImportInput | null => {
  const result: Partial<BaseStatImportInput> = { heroName: sheetName };

  const allFields = BASE_STAT_FIELD_GROUPS.flatMap((g) => g.fields);

  for (let i = 0; i < rows.length; i++) {
    const label = toStr(rows[i]?.[0]).toLowerCase();

    const matchedField = allFields.find((f) => f.label.toLowerCase() === label);
    if (matchedField) {
      const lv1Val = toNum(rows[i]?.[1]);
      const lv15Val = toNum(rows[i]?.[2]);
      const growthCol = rows[i]?.[3];

      (result as any)[matchedField.key] = lv1Val;

      if (matchedField.growthKey) {
        if (growthCol !== null && growthCol !== undefined && growthCol !== '' && toStr(growthCol) !== '') {
          (result as any)[matchedField.growthKey] = toNum(growthCol);
        } else if (lv15Val !== 0 || lv1Val !== 0) {
          (result as any)[matchedField.growthKey] = Math.round(((lv15Val - lv1Val) / 14) * 10000) / 10000;
        } else {
          (result as any)[matchedField.growthKey] = 0;
        }
      }
    }
  }

  const hasData = result.hp !== undefined || result.physical_attack !== undefined;
  if (!hasData) return null;

  return {
    heroName: result.heroName || sheetName,
    hp: toNum(result.hp),
    mana: toNum(result.mana),
    energy: toNum(result.energy),
    hp_regen: toNum(result.hp_regen),
    mana_regen: toNum(result.mana_regen),
    energy_regen: toNum(result.energy_regen),
    physical_attack: toNum(result.physical_attack),
    physical_defense: toNum(result.physical_defense),
    magic_power: toNum(result.magic_power),
    magic_defense: toNum(result.magic_defense),
    attack_speed: toNum(result.attack_speed),
    movement_speed: toNum(result.movement_speed),
    spell_vamp_ratio: toNum(result.spell_vamp_ratio),
    attack_range: toNum(result.attack_range),
    crit_rate: toNum(result.crit_rate),
    crit_damage: toNum(result.crit_damage),
    physical_pen: toNum(result.physical_pen),
    magical_pen: toNum(result.magical_pen),
    lifesteal: toNum(result.lifesteal),
    resilience: toNum(result.resilience),
    crit_damage_reduction: toNum(result.crit_damage_reduction),
    received_heal: toNum(result.received_heal),
    hp_growth: toNum(result.hp_growth),
    mana_growth: toNum(result.mana_growth),
    energy_growth: toNum(result.energy_growth),
    hp_regen_growth: toNum(result.hp_regen_growth),
    mana_regen_growth: toNum(result.mana_regen_growth),
    energy_regen_growth: toNum(result.energy_regen_growth),
    physical_attack_growth: toNum(result.physical_attack_growth),
    physical_defense_growth: toNum(result.physical_defense_growth),
    magic_power_growth: toNum(result.magic_power_growth),
    magic_defense_growth: toNum(result.magic_defense_growth),
    attack_speed_growth: toNum(result.attack_speed_growth),
  };
};

export const parseBaseStatFile = async (file: File): Promise<BaseStatImportInput[]> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const results: BaseStatImportInput[] = [];

  for (const name of wb.SheetNames) {
    if (['Petunjuk', 'Instructions', 'Guide'].includes(name)) continue;

    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: null,
      blankrows: true,
    }) as (string | number | null)[][];

    // Try new format first (per-hero sheet with label-value)
    const parsed = parseHeroSheetNew(name, rows);
    if (parsed) {
      results.push(parsed);
      continue;
    }

    // Fallback: old format (table with headers)
    const jsonRows = XLSX.utils.sheet_to_json<BaseStatImportRow>(ws, { defval: '' });
    const cleanRows = jsonRows.filter((row) => toStr(row['Nama Hero']).length > 0);
    cleanRows.forEach((row) => {
      results.push({
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
      });
    });
  }

  if (results.length === 0) {
    throw new Error('File tidak berisi data base stat yang valid.');
  }

  return results;
};

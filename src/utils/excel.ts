import XLSX from 'xlsx-js-style';

export interface SheetSection {
  title?: string;
  aoa: (string | number | null | undefined)[][];
  columnWidths?: number[];
}

export interface SheetDefinition {
  name: string;
  aoa: (string | number | null | undefined)[][];
  columnWidths?: number[];
  sections?: SheetSection[];
}

export interface CellStyle {
  font?: { bold?: boolean; color?: { rgb?: string }; sz?: number };
  fill?: { fgColor?: { rgb?: string } };
  alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean };
  border?: {
    top?: { style?: string; color?: { rgb?: string } };
    bottom?: { style?: string; color?: { rgb?: string } };
    left?: { style?: string; color?: { rgb?: string } };
    right?: { style?: string; color?: { rgb?: string } };
  };
}

export interface StyledCell {
  v: string | number | null | undefined;
  t?: string;
  s?: CellStyle;
}

export interface StyledSheetDefinition {
  name: string;
  data: StyledCell[][];
  columnWidths?: number[];
  merges?: XLSX.Range[];
}

const SHEET_NAME_MAX_LEN = 31;
const SHEET_NAME_FORBIDDEN = /[\\/:*?[\]]/g;

export const sanitizeSheetName = (name: string): string => {
  const cleaned = (name || 'Sheet').replace(SHEET_NAME_FORBIDDEN, ' ').trim();
  return (cleaned || 'Sheet').slice(0, SHEET_NAME_MAX_LEN);
};

const uniqueSheetName = (used: Set<string>, base: string): string => {
  const safe = sanitizeSheetName(base);
  if (!used.has(safe)) {
    used.add(safe);
    return safe;
  }
  let i = 2;
  while (used.has(sanitizeSheetName(`${safe} (${i})`))) i++;
  const finalName = sanitizeSheetName(`${safe} (${i})`);
  used.add(finalName);
  return finalName;
};

const buildSheetFromSections = (sections: SheetSection[]): XLSX.WorkSheet => {
  const merged: (string | number | null | undefined)[][] = [];
  let maxCols = 0;
  let widthHints: number[] = [];

  sections.forEach((section, idx) => {
    if (idx > 0) merged.push([]);
    if (section.title) merged.push([section.title]);
    section.aoa.forEach((row) => merged.push(row));
    section.aoa.forEach((row) => {
      if (row.length > maxCols) maxCols = row.length;
    });
    if (section.columnWidths && section.columnWidths.length > widthHints.length) {
      widthHints = section.columnWidths;
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(merged);
  if (widthHints.length > 0) {
    ws['!cols'] = widthHints.map((w) => ({ wch: w }));
  } else if (maxCols > 0) {
    ws['!cols'] = Array.from({ length: maxCols }, () => ({ wch: 20 }));
  }
  return ws;
};

const buildSheetFromAoa = (
  aoa: (string | number | null | undefined)[][],
  columnWidths?: number[],
): XLSX.WorkSheet => {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  if (columnWidths && columnWidths.length > 0) {
    ws['!cols'] = columnWidths.map((w) => ({ wch: w }));
  } else if (aoa.length > 0) {
    const cols = aoa[0]?.length ?? 0;
    ws['!cols'] = Array.from({ length: cols }, () => ({ wch: 20 }));
  }
  return ws;
};

export const exportStyledSheetsToExcel = (sheets: StyledSheetDefinition[], fileName: string): void => {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();

  sheets.forEach((sheet) => {
    const ws: XLSX.WorkSheet = {};
    let maxCol = 0;

    sheet.data.forEach((row, r) => {
      row.forEach((cell, c) => {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (cell.v === null || cell.v === undefined) {
          ws[ref] = { v: '', t: 's', s: cell.s || {} };
        } else if (typeof cell.v === 'number') {
          ws[ref] = { v: cell.v, t: 'n', s: cell.s || {} };
        } else {
          ws[ref] = { v: String(cell.v), t: 's', s: cell.s || {} };
        }
        if (c > maxCol) maxCol = c;
      });
    });

    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sheet.data.length - 1, c: maxCol } });

    if (sheet.columnWidths) {
      ws['!cols'] = sheet.columnWidths.map((w) => ({ wch: w }));
    }

    if (sheet.merges) {
      ws['!merges'] = sheet.merges;
    }

    const name = uniqueSheetName(used, sheet.name);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  const finalName = fileName.toLowerCase().endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(wb, finalName);
};

export const exportSheetsToExcel = (sheets: SheetDefinition[], fileName: string): void => {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();

  sheets.forEach((sheet) => {
    const ws = sheet.sections
      ? buildSheetFromSections(sheet.sections)
      : buildSheetFromAoa(sheet.aoa, sheet.columnWidths);
    const name = uniqueSheetName(used, sheet.name);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  const finalName = fileName.toLowerCase().endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(wb, finalName);
};

export const readExcelAsRows = async <T>(
  file: File,
  options?: { sheetName?: string; defval?: unknown },
): Promise<T[]> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName =
    options?.sheetName && wb.Sheets[options.sheetName]
      ? options.sheetName
      : wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<T>(ws, { defval: options?.defval ?? '' });
};

export const readExcelAsAllSheets = async <T>(
  file: File,
  options?: { defval?: unknown; range?: number },
): Promise<Record<string, T[]>> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const out: Record<string, T[]> = {};
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    out[name] = XLSX.utils.sheet_to_json<T>(ws, {
      defval: options?.defval ?? '',
      range: options?.range,
    });
  }
  return out;
};

export const readExcelAsAoa = async (
  file: File,
): Promise<Record<string, (string | number | null)[][]>> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const out: Record<string, (string | number | null)[][]> = {};
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    out[name] = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: null,
      blankrows: true,
    }) as (string | number | null)[][];
  }
  return out;
};

export const toStr = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  return String(v).trim();
};

export const toNum = (v: unknown): number => {
  if (v === null || v === undefined || v === '') return 0;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, '.'));
  return Number.isFinite(n) ? n : 0;
};

export const toList = (v: unknown): string[] => {
  const s = toStr(v);
  if (!s) return [];
  return s
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

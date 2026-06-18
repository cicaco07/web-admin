export interface AuditLog {
  _id: string;
  user: string | null;
  action: string;
  inputData: string | null;
  resultData: string | null;
  ipAddress: string;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

export interface AuditLogFilterInput {
  userId?: string;
  action?: string;
  success?: boolean | null;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export interface AuditLogResponse {
  items: AuditLog[];
  totalCount: number;
  hasNextPage: boolean;
}

export const createDefaultAuditLogFilter = (): AuditLogFilterInput => ({
  page: 1,
  limit: 20,
});

export const AUDIT_STATUS_OPTIONS = [
  { id: '', text: 'Semua Status' },
  { id: 'true', text: 'Berhasil' },
  { id: 'false', text: 'Gagal' },
];

import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import type { Ref } from 'vue';
import type { AuditLogFilterInput } from '../../types/AuditLog';

const AUDIT_LOG_FIELDS = `
  _id
  user
  action
  inputData
  resultData
  ipAddress
  success
  errorMessage
  createdAt
`;

const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($filter: AuditLogFilterInput) {
    auditLogs(filter: $filter) {
      items { ${AUDIT_LOG_FIELDS} }
      totalCount
      hasNextPage
    }
  }
`;

const queryOptions = (token: string) => ({
  context: { headers: { Authorization: `Bearer ${token}` } },
});

export function useAuditLogs(token: string, filter: Ref<AuditLogFilterInput>) {
  return useQuery(
    GET_AUDIT_LOGS,
    () => ({ filter: filter.value }),
    () => ({
      ...queryOptions(token),
      fetchPolicy: 'network-only' as const,
    }),
  );
}

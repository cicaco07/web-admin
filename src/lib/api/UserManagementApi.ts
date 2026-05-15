import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const USER_FIELDS = `
  _id
  name
  email
  role
  createdAt
  updatedAt
`;

const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers { ${USER_FIELDS} }
  }
`;

const REGISTER_USER = gql`
  mutation RegisterUser($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      user { ${USER_FIELDS} }
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($updateUserRoleInput: UpdateUserRoleInput!) {
    updateUserRole(updateUserRoleInput: $updateUserRoleInput) { ${USER_FIELDS} }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($userId: String!) {
    deleteUser(userId: $userId)
  }
`;

const mutationOptions = (token: string) => ({ context: { headers: { Authorization: `Bearer ${token}` } } });

export function useManagedUsers(token: string) {
  return useQuery(GET_ALL_USERS, null, mutationOptions(token));
}

export function useRegisterManagedUser(token: string) {
  const { mutate, onDone, onError } = useMutation(REGISTER_USER, mutationOptions(token));
  return { registerManagedUser: mutate, onDone, onError };
}

export function useUpdateManagedUserRole(token: string) {
  const { mutate, onDone, onError } = useMutation(UPDATE_USER_ROLE, mutationOptions(token));
  return { updateManagedUserRole: mutate, onDone, onError };
}

export function useDeleteManagedUser(token: string) {
  const { mutate, onDone, onError } = useMutation(DELETE_USER, mutationOptions(token));
  return { deleteManagedUser: mutate, onDone, onError };
}

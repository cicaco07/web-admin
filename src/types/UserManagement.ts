export type UserRole = 'user' | 'member' | 'super_admin';

export interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreateFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserRoleFormData {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

export const USER_ROLE_OPTIONS: UserRole[] = ['user', 'member', 'super_admin'];

export const createDefaultUserCreateForm = (): UserCreateFormData => ({
  name: '',
  email: '',
  password: '',
  role: 'user',
});

export const createDefaultUserRoleForm = (): UserRoleFormData => ({
  name: '',
  email: '',
  role: 'user',
});

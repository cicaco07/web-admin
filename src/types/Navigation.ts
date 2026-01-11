export interface Navigation {
  _id: string;
  name: string;
  route: string;
  icon: string;
  parent_id: string | null;
  roles: string[];
  order: number;
  is_header: boolean;
  component: string;
  level: number;
  children?: Navigation[];
  // Computed fields for display
  parentName?: string;
  isParent?: boolean;
  hasChildren?: boolean;
}

export interface NavigationFormData {
  _id?: string;
  name: string;
  route: string;
  icon: string;
  parent_id: string | null;
  roles: string[];
  order: number;
  is_header: boolean;
  component: string;
  level: number;
}

export const createDefaultNavigationForm = (): NavigationFormData => ({
  name: '',
  route: '',
  icon: '',
  parent_id: null,
  roles: [],
  order: 0,
  is_header: false,
  component: '',
  level: 0
});

export const ROLE_OPTIONS = ['super_admin', 'member', 'user'] as const;

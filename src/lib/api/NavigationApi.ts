import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_NAVIGATION_TREE = gql`
  query {
    getNavigationTree {
      _id
      name
      parent_id
      icon
      route
      roles
      order
      is_header
      component
      level
      children {
        _id
        name
        parent_id
        route
        roles
        order
        component
        level
        is_header
      }
    }
  }
`;

const GET_USER_NAVIGATIONS = gql`
  query {
    getUserNavigations {
      _id
      name
      parent_id
      icon
      route
      is_header
      is_active
      order
      roles
      permissions
      level
      component
      is_visible
      children {
        _id
        name
        parent_id
        icon
        route
        is_header
        is_active
        order
        roles
        permissions
        level
        component
        is_visible
        children {
          _id
          name
          parent_id
          icon
          route
          is_header
          is_active
          order
          roles
          permissions
          level
          component
          is_visible
        }
      }
    }
  }
`;

const CREATE_NAVIGATION = gql`
  mutation CreateNavigation($createNavigationInput: CreateNavigationInput!) {
    createNavigation(createNavigationInput: $createNavigationInput) {
      _id
    }
  }
`;

const UPDATE_NAVIGATION = gql`
  mutation UpdateNavigation($updateNavigationInput: UpdateNavigationInput!) {
    updateNavigation(updateNavigationInput: $updateNavigationInput) {
      _id
    }
  }
`;

const REMOVE_NAVIGATION = gql`
  mutation RemoveNavigation($id: ID!) {
    removeNavigation(id: $id)
  }
`;

export function useGetNavigationTree(token: string) {
  return useQuery(GET_NAVIGATION_TREE, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export function useGetUserNavigations(token: string) {
  return useQuery(GET_USER_NAVIGATIONS, {
    fetchPolicy: 'cache-first',
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export function useCreateNavigation(token: string) {
  const { mutate: createNavigation, onDone, onError } = useMutation(CREATE_NAVIGATION, {
    refetchQueries: ['getUserNavigations', 'getNavigationTree'],
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { createNavigation, onDone, onError };
}

export function useUpdateNavigation(token: string) {
  const { mutate: updateNavigation, onDone, onError } = useMutation(UPDATE_NAVIGATION, {
    refetchQueries: ['getUserNavigations', 'getNavigationTree'],
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return { updateNavigation, onDone, onError };
}

export function useDeleteNavigation(token: string) {
  const { mutate: deleteNavigation, onDone, onError } = useMutation(REMOVE_NAVIGATION, {
    refetchQueries: ['getUserNavigations', 'getNavigationTree'],
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { deleteNavigation, onDone, onError };
}
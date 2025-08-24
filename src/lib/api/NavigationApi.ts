import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

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
  mutation CreateNavigation($input: NavigationInput!) {
    createNavigation(createNavigationInput: $input) {
      _id
    }
  }
`;

const UPDATE_NAVIGATION = gql`
  mutation UpdateNavigation($id: ID!, $input: NavigationInput!) {
    updateNavigation(id: $id, updateNavigationInput: $input) {
      _id
    }
  }
`;

export function useGetUserNavigations(token: string) {
  return useQuery(GET_USER_NAVIGATIONS, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export function useCreateNavigation(token: string) {
  const { mutate: createNavigation, onDone, onError } = useMutation(CREATE_NAVIGATION, {
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
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return { updateNavigation, onDone, onError };
}

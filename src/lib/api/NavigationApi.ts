import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_NAVIGATION_TREE = gql`
  query GetNavigationTree {
    getNavigationTree {
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
      name
      parent_id
      icon
      route
      is_header
      is_active
      order
      roles
      permissions
      description
      level
      component
      is_visible
      createdAt
      updatedAt
    }
  }
`;

export function useGetNavigationTree() {
  return useQuery(GET_NAVIGATION_TREE);
}

export function useCreateNavigation() {
  const { mutate: createNavigation, onDone, onError } = useMutation(CREATE_NAVIGATION);
  return { createNavigation, onDone, onError };
}
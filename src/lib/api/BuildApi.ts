import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_BUILDS = gql`
  query GetBuilds {
    builds {
      _id
      name
      role
      description
      hero {
        _id
        name
        image
      }
      items {
        item {
          _id
          name
          image
          type
        }
        order
      }
      emblems {
        _id
        name
        icon
      }
      battle_spells {
        _id
        name
        icon
      }
      user {
        _id
        name
      }
      is_official
    }
  }
`;

const CREATE_BUILD = gql`
  mutation CreateBuild($createBuildInput: CreateBuildInput!) {
    createBuild(createBuildInput: $createBuildInput) {
      _id
      name
      role
    }
  }
`;

const UPDATE_BUILD = gql`
  mutation UpdateBuild($id: ID!, $updateBuildInput: CreateBuildInput!) {
    updateBuild(id: $id, updateBuildInput: $updateBuildInput) {
      _id
      name
      role
    }
  }
`;

const DELETE_BUILD = gql`
  mutation RemoveBuild($id: ID!) {
    removeBuild(id: $id)
  }
`;

export function useBuilds() {
  return useQuery(GET_BUILDS);
}

export function useCreateBuild(token: string) {
  const { mutate: createBuild, onDone, onError } = useMutation(CREATE_BUILD, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { createBuild, onDone, onError };
}

export function useUpdateBuild(token: string) {
  const { mutate: updateBuild, onDone, onError } = useMutation(UPDATE_BUILD, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { updateBuild, onDone, onError };
}

export function useDeleteBuild(token: string) {
  const { mutate: deleteBuild, onDone, onError } = useMutation(DELETE_BUILD, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { deleteBuild, onDone, onError };
}

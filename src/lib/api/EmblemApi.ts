import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_EMBLEMS = gql`
  query GetEmblems {
    emblems {
      _id
      name
      type
      icon
      benefit
      description
      cooldown
    }
  }
`;

const CREATE_EMBLEM = gql`
  mutation CreateEmblem($input: CreateEmblemInput!) {
    createEmblem(input: $input) {
      _id
      name
    }
  }
`;

const UPDATE_EMBLEM = gql`
  mutation UpdateEmblem($id: ID!, $input: UpdateEmblemInput!) {
    updateEmblem(id: $id, input: $input) {
      _id
      name
    }
  }
`;

const DELETE_EMBLEM = gql`
  mutation DeleteEmblem($id: ID!) {
    removeEmblem(id: $id) {
      _id
    }
  }
`;

export function useEmblems() {
  return useQuery(GET_EMBLEMS);
}

export function useCreateEmblem() {
  const { mutate: createEmblem, onDone, onError } = useMutation(CREATE_EMBLEM);
  return { createEmblem, onDone, onError };
}

export function useUpdateEmblem() {
  const { mutate: updateEmblem, onDone, onError } = useMutation(UPDATE_EMBLEM);
  return { updateEmblem, onDone, onError };
}

export function useDeleteEmblem() {
  const { mutate: deleteEmblem, onDone, onError } = useMutation(DELETE_EMBLEM);
  return { deleteEmblem, onDone, onError };
}
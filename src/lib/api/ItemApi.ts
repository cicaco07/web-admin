import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_ITEMS = gql`
  query items {
    items {
      _id
      name
      type
      tag
      attributes
      price
      image
      story
      description
      tips
      parent_items
    }
  }
`;

const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      _id
      name
    }
  }
`;

const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      _id
      name
    }
  }
`;

const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    removeItem(id: $id) {
      _id
    }
  }
`;

export function useItems() {
  return useQuery(GET_ITEMS);
}

export function useCreateItem(token: string) {
  const { mutate: createItem, onDone, onError } = useMutation(CREATE_ITEM, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { createItem, onDone, onError };
}

export function useUpdateItem(token: string) {
  const { mutate: updateItem, onDone, onError } = useMutation(UPDATE_ITEM, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { updateItem, onDone, onError };
}

export function useDeleteItem(token: string) {
  const { mutate: deleteItem, onDone, onError } = useMutation(DELETE_ITEM, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { deleteItem, onDone, onError };
}
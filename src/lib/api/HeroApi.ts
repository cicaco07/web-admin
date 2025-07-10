import { useQuery, useMutation } from '@vue/apollo-composable';
import { gql } from 'graphql-tag';
// import { ref } from 'vue';

const GET_HEROES = gql`
  query GetHeroes {
    heroes {
      _id
      name
      alias
      image
      avatar
      role
      type
      short_description
      release_date
      durability
      offense
      control_effect
      difficulty
    }
  }
`;

const CREATE_HERO = gql`
  mutation CreateHero($input: CreateHeroInput!) {
    createHero(input: $input) {
      _id
      name
    }
  }
`;

const UPDATE_HERO = gql`
  mutation UpdateHero($id: ID!, $input: UpdateHeroInput!) {
    updateHero(id: $id, input: $input) {
      _id
      name
    }
  }
`;

const DELETE_HERO = gql`
  mutation DeleteHero($id: ID!) {
    removeHero(id: $id) {
      _id
    }
  }
`;

export function useHeroes() {
  return useQuery(GET_HEROES);
}

export function useCreateHero() {
  const { mutate: createHero, onDone, onError } = useMutation(CREATE_HERO);
  return { createHero, onDone, onError };
}

export function useUpdateHero() {
  const { mutate: updateHero, onDone, onError } = useMutation(UPDATE_HERO);
  return { updateHero, onDone, onError };
}

export function useDeleteHero() {
  const { mutate: deleteHero, onDone, onError } = useMutation(DELETE_HERO);
  return { deleteHero, onDone, onError };
}
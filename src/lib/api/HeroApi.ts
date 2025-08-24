import { useQuery, useMutation } from '@vue/apollo-composable';
import { gql } from 'graphql-tag';

const GET_ALL_HEROES = gql`
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

const GET_HERO_BY_ID = gql`
  query findById($id: ID!) {
    hero(id: $id) {
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
  return useQuery(GET_ALL_HEROES, );
}

export function useHeroById(id: string) {
  return useQuery(GET_HERO_BY_ID, () => ({ id }));
}

export function useCreateHero(token: string) {
  const { mutate: createHero, onDone, onError } = useMutation(CREATE_HERO, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { createHero, onDone, onError };
}

export function useUpdateHero(token: string) {
  const { mutate: updateHero, onDone, onError } = useMutation(UPDATE_HERO, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { updateHero, onDone, onError };
}

export function useDeleteHero(token: string) {
  const { mutate: deleteHero, onDone, onError } = useMutation(DELETE_HERO, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  return { deleteHero, onDone, onError };
}
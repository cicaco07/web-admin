import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_SKILLS = gql`
  query GetSkills {
    heroes {
      name
      skills {
        _id
        name
        type
        tag
        skill_icon
        lite_description
        full_description
      }
    }
  }
`;

const ADD_SKILL_TO_HERO = gql`
  mutation AddSkillToHero($heroId: ID!, $input: CreateSkillInput!) {
    addSkillToHero(heroId: $heroId, input: $input) {
      _id
      name
      type
    }
  }
`;

const UPDATE_SKILL = gql`
  mutation UpdateSkill($id: ID!, $input: UpdateSkillInput!) {
    updateSkill(id: $id, input: $input) {
      _id
      name
      type
    }
  }
`;

const DELETE_SKILL = gql`
  mutation DeleteSkill($id: ID!) {
    removeSkill(id: $id) {
      _id
    }
  }
`;

export function useSkills() {
  return useQuery(GET_SKILLS);
}

export function useAddSkillToHero() {
  const { mutate: addSkillToHero, onDone, onError } = useMutation(ADD_SKILL_TO_HERO);
  return { addSkillToHero, onDone, onError };
}

export function useUpdateSkill() {
  const { mutate: updateSkill, onDone, onError } = useMutation(UPDATE_SKILL);
  return { updateSkill, onDone, onError };
}

export function useDeleteSkill() {
  const { mutate: deleteSkill, onDone, onError } = useMutation(DELETE_SKILL);
  return { deleteSkill, onDone, onError };
}
import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_SKILLS = gql`
  query GetSkills {
    heroes {
      name
      skills {
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

export function useSkills() {
  return useQuery(GET_SKILLS);
}

export function useAddSkillToHero() {
  const { mutate: addSkillToHero, loading, error } = useMutation(ADD_SKILL_TO_HERO);
  return { addSkillToHero, loading, error };
}
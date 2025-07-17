import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_SKILLS_DETAIL = gql`
  query GetSkillsDetail {
    skills {
      _id
      name
      skills_detail {
        level
        attributes
      }
    }
  }
`;

const ADD_SKILL_DETAIL_TO_SKILL = gql`
  mutation AddSkillDetailToSkill($skillId: ID!, $input: [CreateSkillDetailInput!]!) {
    addSkillDetailToSkill(skillId: $skillId, input: $input) {
      level
      attributes
    }
  }
`;

export const useSkillsDetail = () => {
  return useQuery(GET_SKILLS_DETAIL);
}

export function useAddSkillDetailToSkill() {
  const { mutate: addSkillDetailToSkill, onDone, onError } = useMutation(ADD_SKILL_DETAIL_TO_SKILL);
  return { addSkillDetailToSkill, onDone, onError };
}
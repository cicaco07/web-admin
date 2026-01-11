import { useMutation, useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

const GET_SKILLS_DETAIL = gql`
  query GetSkillsDetail {
    skills {
      _id
      name
      skills_detail {
        _id
        level
        attributes
      }
    }
  }
`;

const ADD_SKILL_DETAIL_TO_SKILL = gql`
  mutation AddSkillDetailToSkill($skillId: ID!, $input: [CreateSkillDetailInput!]!) {
    addSkillDetailToSkill(skillId: $skillId, input: $input) {
      _id
      level
      attributes
    }
  }
`;

const UPDATE_SKILL_DETAIL_TO_SKILL = gql`
  mutation UpdateSkillDetailToSkill($skillId: ID!, $skillDetailId: ID!, $input: UpdateSkillDetailInput!) {
    updateSkillDetailToSkill(skillId: $skillId, skillDetailId: $skillDetailId, input: $input) {
      _id
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

export function useUpdateSkillDetailToSkill() {
  const { mutate: updateSkillDetailToSkill, onDone, onError } = useMutation(UPDATE_SKILL_DETAIL_TO_SKILL);
  return { updateSkillDetailToSkill, onDone, onError };
}
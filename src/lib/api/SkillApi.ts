import { useQuery } from "@vue/apollo-composable";
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

export function useSkills() {
  return useQuery(GET_SKILLS);
}
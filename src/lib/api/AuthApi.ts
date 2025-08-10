import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      access_token
      user {
        _id
        name
        email
        role
      }
    }
  }
`;

const REGISTER = gql`
  mutation RegisterUser($email: String!, $name: String!, $password: String!) {
    register(registerInput: { email: $email, name: $name, password: $password }) {
      access_token
      user {
        _id
        email
        name
        role
        createdAt
      }
    }
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

export function useLogin() {
  const { mutate: login, onDone, onError } = useMutation(LOGIN);
  return { login, onDone, onError };
}

export function useRegister() {
  const { mutate: register, onDone, onError } = useMutation(REGISTER);
  return { register, onDone, onError };
}

export function useLogout() {
  const { mutate: logout, onDone, onError } = useMutation(LOGOUT);
  return { logout, onDone, onError };
}
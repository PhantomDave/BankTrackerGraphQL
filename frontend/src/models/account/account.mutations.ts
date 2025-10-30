import { gql } from 'apollo-angular';

export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($email: String!, $password: String!) {
    createAccount(email: $email, password: $password) {
      id
      email
      createdAt
      updatedAt
    }
  }
`;


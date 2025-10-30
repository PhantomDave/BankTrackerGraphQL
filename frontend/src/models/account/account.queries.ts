import {gql} from 'apollo-angular';

export const GET_ACCOUNT_BY_EMAIL = gql`
  query GetAccountByEmail($email: String!) {
    accountByEmail(email: $email) {
      id
      email
      createdAt
      updatedAt
    }
  }
`;

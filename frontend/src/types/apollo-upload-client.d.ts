declare module 'apollo-upload-client/UploadHttpLink.mjs' {
  import { ApolloLink } from '@apollo/client';

  export default class UploadHttpLink extends ApolloLink {
    constructor(options?: {
      uri?: string;
      headers?: Record<string, string>;
      fetchOptions?: RequestInit;
      credentials?: RequestCredentials;
      includeExtensions?: boolean;
      includeUnusedVariables?: boolean;
      useGETForQueries?: boolean;
    });
  }
}

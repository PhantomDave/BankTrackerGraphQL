/// <reference types="node" />

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.USE_LOCAL_SCHEMA === 'true' ? './schema.graphql' : 'http://localhost:5095/graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular'],
      config: {
        addExplicitOverride: true,
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          Decimal: 'number',
          UUID: 'string',
          Long: 'number',
          Upload: 'File',
        },
        namingConvention: {
          enumValues: 'keep',
        },
      },
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
  watch: false,
  ignoreNoDocuments: true,
};

export default config;

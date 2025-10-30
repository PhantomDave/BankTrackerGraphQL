import type { CodegenConfig } from '@graphql-codegen/cli';

const schemaUrl = process.env.GRAPHQL_SCHEMA_URL || 'http://localhost:5095/graphql';

const config: CodegenConfig = {
  schema: schemaUrl,
  documents: ['src/**/*.graphql'],
  generates: {
    './src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-apollo-angular',
      ],
      config: {
        addExplicitOverride: true,
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          Decimal: 'number',
          UUID: 'string',
          Long: 'number',
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

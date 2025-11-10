/// <reference types="node" />

import { createHmac, randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { CodegenConfig } from '@graphql-codegen/cli';

type JwtConfig = {
  Secret?: string;
  Issuer?: string;
  Audience?: string;
  ExpiryMinutes?: number;
};

const schemaUrl = process.env.GRAPHQL_SCHEMA_URL ?? 'http://127.0.0.1:5095/graphql';
const defaultEmail = process.env.GRAPHQL_CODEGEN_EMAIL ?? 'codegen@banktracking.local';
const defaultUserId = process.env.GRAPHQL_CODEGEN_ACCOUNT_ID ?? '0';
const defaultExpiryMinutes = 60;

const loadJwtConfig = (): JwtConfig => {
  const override: JwtConfig = {
    Secret: process.env.GRAPHQL_JWT_SECRET,
    Issuer: process.env.GRAPHQL_JWT_ISSUER,
    Audience: process.env.GRAPHQL_JWT_AUDIENCE,
    ExpiryMinutes: process.env.GRAPHQL_JWT_EXPIRY
      ? Number.parseInt(process.env.GRAPHQL_JWT_EXPIRY, 10)
      : undefined,
  };

  if (override.Secret) {
    return override;
  }

  try {
    const configPath = join(
      __dirname,
      '..',
      'PhantomDave.BankTracking.Api',
      'appsettings.Development.json',
    );
    const fileContent = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    const jwt = (parsed?.Jwt ?? {}) as JwtConfig;
    return {
      Secret: jwt.Secret ?? override.Secret,
      Issuer: jwt.Issuer ?? override.Issuer,
      Audience: jwt.Audience ?? override.Audience,
      ExpiryMinutes: jwt.ExpiryMinutes ?? override.ExpiryMinutes,
    };
  } catch (error) {
    console.warn('Warning: Unable to read appsettings.Development.json for JWT settings.', error);
    return override;
  }
};

const toBase64Url = (value: string) => Buffer.from(value).toString('base64url');

const buildJwt = (jwtConfig: JwtConfig): string | undefined => {
  const secret = jwtConfig.Secret;
  if (!secret) {
    console.warn('Warning: Missing JWT secret; falling back to unauthenticated schema fetch.');
    return undefined;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiryMinutes = Number.isFinite(jwtConfig.ExpiryMinutes)
    ? Number(jwtConfig.ExpiryMinutes)
    : defaultExpiryMinutes;

  const payloadBase = {
    iss: jwtConfig.Issuer,
    aud: jwtConfig.Audience,
    exp: nowSeconds + expiryMinutes * 60,
    nbf: nowSeconds - 5,
    iat: nowSeconds,
    jti: randomUUID(),
    sub: defaultEmail,
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': defaultUserId,
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': defaultEmail,
  };

  const payload = Object.fromEntries(
    Object.entries(payloadBase).filter(([, value]) => value !== undefined && value !== ''),
  );

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
};

const getAuthToken = (): string | undefined => {
  if (process.env.GRAPHQL_AUTH_TOKEN) {
    return process.env.GRAPHQL_AUTH_TOKEN;
  }

  const jwtConfig = loadJwtConfig();
  return buildJwt(jwtConfig);
};

const buildSchemaConfig = (token: string | undefined): CodegenConfig['schema'] => {
  if (!token) {
    return schemaUrl;
  }

  return {
    [schemaUrl]: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  };
};

const token = getAuthToken();

if (!token) {
  console.warn(
    'Warning: Proceeding without Authorization header. GraphQL code generation may fail if the endpoint requires authentication.',
  );
}

const config: CodegenConfig = {
  schema: buildSchemaConfig(token),
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

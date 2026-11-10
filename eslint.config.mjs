import nx from '@nx/eslint-plugin';
import jsoncParser from 'jsonc-eslint-parser';

const infraPackages = [
  '@nestjs/*',
  'typeorm',
  'pg',
  'ioredis',
  'bullmq',
  'kafkajs',
  '@aws-sdk/*',
  '@grpc/*',
  'rxjs',
];

const dependencyCheckIgnoredFiles = [
  '{projectRoot}/eslint.config.mjs',
  '{projectRoot}/jest.config.cts',
  '{projectRoot}/jest.integration.config.cts',
  '{projectRoot}/webpack.config.js',
  '{projectRoot}/**/*.spec.ts',
  '{projectRoot}/src/**/testing/**',
];

const runtimeOnlyPackages = ['tslib', 'reflect-metadata'];

// Apps brauchen diese Pakete zur Laufzeit (Treiber, Nest-Plattform, Peers), ohne sie direkt zu importieren.
const appRuntimePackages = [
  ...runtimeOnlyPackages,
  '@nestjs/core',
  '@nestjs/platform-express',
  '@nestjs/microservices',
  '@grpc/grpc-js',
  'rxjs',
  'express',
  'pg',
  'ioredis',
];

const dependencyChecks = (files, ignoredDependencies) => ({
  files,
  languageOptions: { parser: jsoncParser },
  rules: {
    '@nx/dependency-checks': [
      'error',
      {
        // Libs sind nicht buildable (nur typecheck), daher typecheck als Bezugs-Target für alle Projekte.
        buildTargets: ['typecheck'],
        checkMissingDependencies: true,
        checkObsoleteDependencies: true,
        checkVersionMismatches: true,
        includeTransitiveDependencies: false,
        ignoredFiles: dependencyCheckIgnoredFiles,
        ignoredDependencies,
      },
    ],
  },
});

const workspaceConfig = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  { ignores: ['**/dist', 'libs/contracts/grpc/src/generated/**'] },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_' },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            // ── Schichten ───────────────────────────────
            {
              sourceTag: 'type:types',
              onlyDependOnLibsWithTags: ['type:types'],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain', 'type:types'],
              bannedExternalImports: infraPackages,
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:types',
              ],
              bannedExternalImports: infraPackages,
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:infrastructure',
                'type:contracts',
                'type:types',
              ],
            },
            {
              sourceTag: 'type:api',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:contracts',
                'type:api',
                'type:types',
              ],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: ['type:contracts', 'type:types'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:infrastructure',
                'type:api',
                'type:contracts',
                'type:types',
              ],
            },

            // ── Service-Grenzen ─────────────────────────
            {
              sourceTag: 'scope:types',
              onlyDependOnLibsWithTags: ['scope:types'],
            },
            {
              sourceTag: 'scope:blog',
              onlyDependOnLibsWithTags: [
                'scope:blog',
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
            {
              sourceTag: 'scope:moderation',
              onlyDependOnLibsWithTags: [
                'scope:moderation',
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
            {
              sourceTag: 'scope:gateway',
              onlyDependOnLibsWithTags: [
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:types'],
            },
            {
              sourceTag: 'scope:contracts',
              onlyDependOnLibsWithTags: ['scope:contracts', 'scope:types'],
            },
            {
              sourceTag: 'scope:cronjob',
              onlyDependOnLibsWithTags: [
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
            {
              sourceTag: 'scope:security',
              onlyDependOnLibsWithTags: [
                'scope:security',
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
            {
              sourceTag: 'scope:audit',
              onlyDependOnLibsWithTags: [
                'scope:audit',
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
            {
              sourceTag: 'scope:twitch-bot',
              onlyDependOnLibsWithTags: [
                'scope:twitch-bot',
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
            {
              sourceTag: 'scope:twitch',
              onlyDependOnLibsWithTags: [
                'scope:twitch',
                'scope:contracts',
                'scope:shared',
                'scope:types',
              ],
            },
          ],
        },
      ],
    },
  },
  // Patterns gelten relativ zur geladenen Projekt-Config, daher **/package.json statt libs/** bzw. apps/*.
  dependencyChecks(['**/package.json'], runtimeOnlyPackages),
];

export const appConfig = [
  ...workspaceConfig,
  dependencyChecks(['**/package.json'], appRuntimePackages),
];

export default workspaceConfig;

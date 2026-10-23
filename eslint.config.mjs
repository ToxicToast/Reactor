import nx from '@nx/eslint-plugin';

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

export default [
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
          ],
        },
      ],
    },
  },
];

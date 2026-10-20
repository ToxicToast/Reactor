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
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            // ── Schichten ───────────────────────────────
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain'],
              bannedExternalImports: infraPackages,
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: ['type:domain', 'type:application'],
              bannedExternalImports: infraPackages,
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:infrastructure',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:api',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:contracts',
                'type:api',
              ],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: ['type:contracts'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:infrastructure',
                'type:api',
                'type:contracts',
              ],
            },

            // ── Service-Grenzen ─────────────────────────
            {
              sourceTag: 'scope:blog',
              onlyDependOnLibsWithTags: [
                'scope:blog',
                'scope:contracts',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:gateway',
              onlyDependOnLibsWithTags: ['scope:contracts', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:contracts',
              onlyDependOnLibsWithTags: ['scope:contracts'],
            },
          ],
        },
      ],
    },
  },
];

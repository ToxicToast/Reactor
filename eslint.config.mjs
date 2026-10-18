import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/test-output',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          // Three tag dimensions, evaluated independently (AND):
          // every project must satisfy its scope, type AND runtime constraint.
          depConstraints: [
            // --- scope: bounded-context isolation -------------------------
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:platform',
              onlyDependOnLibsWithTags: ['scope:platform', 'scope:shared'],
            },
            {
              sourceTag: 'scope:foodfolio',
              onlyDependOnLibsWithTags: [
                'scope:foodfolio',
                'scope:platform',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:blog',
              onlyDependOnLibsWithTags: [
                'scope:blog',
                'scope:platform',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: ['*'],
            },

            // --- type: onion layers ---------------------------------------
            {
              sourceTag: 'type:kernel',
              onlyDependOnLibsWithTags: ['type:kernel'],
              allowedExternalImports: [],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain', 'type:kernel'],
              allowedExternalImports: [],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: ['type:contracts', 'type:kernel'],
              allowedExternalImports: [],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:domain',
                'type:contracts',
                'type:kernel',
              ],
              allowedExternalImports: [],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:infrastructure',
                'type:application',
                'type:domain',
                'type:contracts',
                'type:kernel',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:kernel'],
            },
            {
              // Features never import other features; shared pieces go to type:ui.
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:ui',
                'type:infrastructure',
                'type:application',
                'type:domain',
                'type:contracts',
                'type:kernel',
              ],
            },
            {
              // Composition root: wires features, adapters and use cases.
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:infrastructure',
                'type:application',
                'type:contracts',
                'type:kernel',
              ],
            },
            {
              sourceTag: 'type:e2e',
              onlyDependOnLibsWithTags: ['type:app'],
            },

            // --- runtime: keep server code out of browser bundles -------------
            {
              sourceTag: 'runtime:universal',
              onlyDependOnLibsWithTags: ['runtime:universal'],
            },
            {
              sourceTag: 'runtime:browser',
              onlyDependOnLibsWithTags: [
                'runtime:browser',
                'runtime:universal',
              ],
              bannedExternalImports: ['@nestjs/*'],
            },
            {
              sourceTag: 'runtime:server',
              onlyDependOnLibsWithTags: ['runtime:server', 'runtime:universal'],
              bannedExternalImports: ['react', 'react-dom', 'react-dom/*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];

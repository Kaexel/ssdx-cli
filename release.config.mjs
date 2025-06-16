/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main', 'beta'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          {
            type: 'build',
            scope: 'deps',
            release: 'patch',
          },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            {
              type: 'build',
              section: 'Dependencies and Other Build Updates',
              hidden: false,
            },
            { type: 'ci', section: 'CI' },
            { type: 'docs', section: 'Documentation' },
            { type: 'refactor', section: 'Refactoring' },
            { type: 'test', section: 'Tests' },
            { type: 'dependabot', section: 'Dependabot' },
          ],
        },
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        tarballDir: 'build',
      },
    ],
    '@semantic-release/github',
  ],
};

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
          { type: 'breaking', release: 'major' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'minor' },
          { type: 'refactor', release: 'minor' },
          { type: 'ci', release: 'patch' },
          { type: 'build', release: 'patch' },
          { type: 'dependabot', release: 'patch' },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'breaking', section: 'Breaking Changes' },
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'refactor', section: 'Refactoring' },
            { type: 'test', section: 'Tests' },
            { type: 'docs', section: 'Documentation' },
            { type: 'ci', section: 'CI Updates' },
            { type: 'build', section: 'Build Updates' },
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

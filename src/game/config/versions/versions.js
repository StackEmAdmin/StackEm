import v0_1_0 from './v0_1_0.json';

const LATEST_VERSION = '0.1.0';

const versions = {
  '0.1.0': {
    defaults: v0_1_0.defaults,
    keyMap: v0_1_0.keyMap,
    normalize: (config, keepSeed) => {
      const normalized = { ...config };
      delete normalized.rows;
      delete normalized.cols;
      delete normalized.highlight;
      delete normalized.autoColor;
      if (normalized.queueNthPC <= 1) {
        delete normalized.queueNthPC;
      }
      if (!keepSeed && config.queueNewSeedOnReset) {
        delete normalized.queueSeed;
      }
      if (!keepSeed && config.garbageNewSeedOnReset) {
        delete normalized.garbageSeed;
      }
      return normalized;
    },
    migrate: (config) => config,
  },
};

function migrate(config, version) {
  const versionKeys = Object.keys(versions);
  const startVersion = versionKeys.indexOf(version);

  if (startVersion === -1) {
    throw new Error(`Unknown config version: ${version}`);
  }

  // Apply migrations
  let currentConfig = config;
  for (let i = startVersion + 1; i < versionKeys.length; i++) {
    const nextVersion = versionKeys[i];
    const { migrate: migrateVersion, defaults } = versions[nextVersion];
    currentConfig = { ...defaults, ...migrateVersion(currentConfig) };
  }

  return currentConfig;
}

export { LATEST_VERSION, versions, migrate };

// Expo + monorepo. Watch ONLY this app + the shared package — NOT the whole
// workspace root (which includes web/node_modules + backend and blows past the
// macOS file-watch limit -> EMFILE). Still resolve deps from the root store.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Only watch the shared package (the app root is watched automatically).
config.watchFolders = [path.resolve(workspaceRoot, "shared")];

// Resolve modules from the app first, then the hoisted root store.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Don't crawl other workspaces (web/backend) — avoids the EMFILE watch storm.
config.resolver.blockList = [
  /\/web\/.*/,
  /\/backend\/.*/,
];

module.exports = config;

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const config = getDefaultConfig(__dirname);

// 1. Completely ignore the API folder so Expo Router doesn't find it
config.resolver.blockList = exclusionList([
  /.*\/app\/api\/.*/,
  /.*\/supabase\/functions\/.*/,
]);

// 2. If it SOMEHOW finds it, force it to resolve 'node:crypto' to empty
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "node:crypto": require.resolve("./empty-module.js"),
  "crypto": require.resolve("./empty-module.js"),
  "stream": require.resolve("./empty-module.js"),
};

module.exports = withNativeWind(config, { input: "./app/globals.css" });
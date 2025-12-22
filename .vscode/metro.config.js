const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// 1. Define the path to our empty file
const emptyModule = path.resolve(__dirname, "empty-module.js");

// 2. Force Metro to resolve "node:crypto" to our empty file
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    "node:crypto": emptyModule,
    "crypto": emptyModule,
    "stream": emptyModule,
    "buffer": emptyModule,
};

// 3. Block the API folder from being watched (Safety net)
config.resolver.blockList = [
    /\/app\/api\/.*/,
    /\/supabase\/functions\/.*/,
];

module.exports = withNativeWind(config, { input: "./app/globals.css" });
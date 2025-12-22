const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// EXCLUSION CONFIGURATION
// We use a regex that catches "app/api" anywhere in the path
config.resolver.blockList = [
    /.*\/app\/api\/.*/,
    /.*\/supabase\/functions\/.*/,
];

module.exports = withNativeWind(config, { input: "./app/globals.css" });
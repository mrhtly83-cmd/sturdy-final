/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "react-native",
    "react-native-web",
    "expo",
    "expo-router",
    "react-native-safe-area-context",
    "react-native-gesture-handler",
    "react-native-reanimated",
  ],

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
    };
    return config;
  },
};

module.exports = nextConfig;

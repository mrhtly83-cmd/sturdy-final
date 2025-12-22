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
    "react-native-screens",
  ],

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
    };

    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      ".web.ts",
      ".web.tsx",
      ".web.js",
      ".web.jsx",
    ];

    return config;
  },
};

module.exports = nextConfig;

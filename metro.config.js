const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Fix module resolution for flattened dependencies
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

// Ensure proper platform support
config.resolver.platforms = ["native", "web", "ios", "android"];

module.exports = config;
//

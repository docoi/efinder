// next.config.js
const nextConfig = {
    webpack: (config) => {
      config.cache = false;
      return config;
    },
  };
  
  module.exports = nextConfig;
  
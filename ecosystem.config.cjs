module.exports = {
  apps: [
    {
      name: "feed-aggregator",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_file: ".env",
    },
  ],
};

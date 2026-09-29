const path = require("node:path");
const dotenv = require("dotenv");
const { getFrontendUrl } = require("../services/verificationLinkService");

const loadEnvironment = ({ env = process.env, directory = path.resolve(__dirname, "..") } = {}) => {
  const result = dotenv.config({
    path: path.join(directory, ".env"),
    processEnv: env,
    override: false,
    quiet: true
  });
  // Hosted deployments may supply all settings without an environment file.
  if (result.error && result.error.code !== "ENOENT") {
    throw result.error;
  }
  getFrontendUrl(env);
};

module.exports = { loadEnvironment };

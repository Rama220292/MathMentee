const getFrontendUrl = (env = process.env) => {
  const configuredUrl = env.FRONTEND_URL;

  if (!configuredUrl) {
    throw new Error("FRONTEND_URL is required to send verification emails");
  }

  let frontendUrl;
  try {
    frontendUrl = new URL(configuredUrl.trim());
  } catch {
    throw new Error("FRONTEND_URL must be a valid absolute URL");
  }

  if (!["http:", "https:"].includes(frontendUrl.protocol)) {
    throw new Error("FRONTEND_URL must use http or https");
  }

  return frontendUrl;
};

const buildVerificationLink = (token, env = process.env) => {
  const verificationUrl = new URL("/verify", getFrontendUrl(env));
  verificationUrl.searchParams.set("token", token);
  return verificationUrl.toString();
};

module.exports = { buildVerificationLink, getFrontendUrl };

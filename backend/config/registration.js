// Keep the role available for existing accounts; only self-registration is gated.
const getSignupRoles = () => process.env.ENABLE_CONTENT_MANAGER_SIGNUP === "true"
  ? ["student", "teacher", "content_manager"]
  : ["student", "teacher"];

module.exports = { getSignupRoles };

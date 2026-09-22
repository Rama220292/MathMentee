export const submissionErrorMessage = (error, stage) => {
  const action = stage === "save" ? "save your corrections" : "submit your confirmed answer";
  if (typeof error.response?.data?.err === "string") return error.response.data.err;
  if (error.code === "ERR_NETWORK") {
    return `Could not reach the server to ${action}. Check that the backend is running and your connection is working. Your edits are still on this page.`;
  }
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return `The request to ${action} timed out. Your edits are still on this page. Check your submissions before trying again.`;
  }
  const status = error.response?.status;
  return `Could not ${action}${status ? ` (HTTP ${status})` : ""}. Your edits are still on this page.`;
};

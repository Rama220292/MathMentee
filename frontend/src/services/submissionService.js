import api from "./api";

export const createSubmission = async (data) => {
  const res = await api.post("/submissions", data);
  // console.log("POSTING TO:", api.defaults.baseURL + "/submissions");
  return res.data;
};

export const updateSubmission = async (id, data) => {
  const res = await api.put(`/submissions/${id}`, data);
  return res.data;
};

export const getSubmissionById = async (id) => {
  const res = await api.get(`/submissions/${id}`);
  return res.data;
};

export const getSubmissions = async () => {
  const res = await api.get("/submissions");
  return res.data;
};

export const reviewSubmission = async (id, data) => {
  const res = await api.put(`/submissions/${id}/review`, data);
  return res.data;
};
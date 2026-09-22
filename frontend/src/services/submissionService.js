import api from "./api";

export const createSubmission = async (data) => {
  const res = await api.post("/submissions", data);
  return res.data;
};

export const createHandwritingUploadRequest = async (data) => {
  const res = await api.post("/submissions/handwriting-upload-requests", data);
  return res.data;
};

export const uploadHandwritingImage = async (file, uploadRequest) => {
  let response;
  try {
    response = await fetch(uploadRequest.uploadUrl, {
      method: "PUT",
      headers: uploadRequest.headers,
      body: file
    });
  } catch {
    throw new Error("Could not reach private image storage");
  }
  if (!response.ok) throw new Error(`Image upload failed (HTTP ${response.status})`);
  return uploadRequest.uploadId;
};

export const confirmHandwritingUpload = async (uploadId) => {
  const res = await api.post("/submissions/handwriting-upload-confirmations", { uploadId });
  return res.data;
};

export const extractHandwriting = async (submissionId) => {
  const res = await api.post(`/submissions/${submissionId}/extractions`);
  return res.data;
};

export const saveTranscript = async (submissionId, transcript) => {
  const res = await api.patch(`/submissions/${submissionId}/transcript`, transcript);
  return res.data;
};

export const confirmTranscript = async (submissionId) => {
  const res = await api.post(`/submissions/${submissionId}/confirm`);
  return res.data;
};

export const getSubmissionImageUrl = async (submissionId) => {
  const res = await api.get(`/submissions/${submissionId}/source-image`);
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
  const res = await api.get("/submissions/");
  return res.data;
};

export const reviewSubmission = async (id, data) => {
  const res = await api.put(`/submissions/${id}/review`, data);
  return res.data;
};

export const getMySubmissions = async () => {
  const res = await api.get("/submissions/my");
  return res.data;
};

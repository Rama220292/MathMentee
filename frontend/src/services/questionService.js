import api from "./api";

export const getQuestions = async () => {
  const res = await api.get("/questions");
  return res.data;
};


export const getQuestionById = async (id) => {
  const res = await api.get(`/questions/${id}`);
  return res.data;
};

export const createQuestion = async (data) => {
  const res = await api.post("/questions", data);
  return res.data;
};

export const updateQuestion = async (id, data) => {
  const res = await api.put(`/questions/${id}`, data);
  return res.data;
};

export const deleteQuestion = async (id) => {
  const res = await api.delete(`/questions/${id}`);
  return res.data;
};

export const getQuestionMeta = async () => {
  const res = await api.get("/questions/meta/options");
  return res.data;
};

export const createQuestionImageUploadRequest = async (data) => {
  const res = await api.post("/questions/image-upload-requests", data);
  return res.data;
};

export const uploadQuestionImage = async (file, uploadRequest) => {
  let response;

  try {
    response = await fetch(uploadRequest.uploadUrl, {
      method: "PUT",
      headers: uploadRequest.headers,
      body: file
    });
  } catch {
    throw new Error(
      "Could not reach S3. Check the bucket region and localhost CORS configuration."
    );
  }

  if (!response.ok) {
    throw new Error(
      `S3 rejected the image upload (HTTP ${response.status}). Check the bucket region and IAM permission.`
    );
  }

  return { objectKey: uploadRequest.objectKey };
};

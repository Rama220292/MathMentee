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
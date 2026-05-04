import api from "./api";

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};


export const signup = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await api.get(`/auth/verify?token=${token}`);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
import api from "./api.js";
import axios from "axios";

export const registerUser = async (userData) => {
  try {
    const response = await api.post("register", userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      const timeoutError = {
        msg: "A API demorou para responder. Por favor, aguarde alguns instantes e tente novamente.",
        isTimeout: true,
      };
      throw timeoutError;
    }

    throw error.response?.data || error.msg;
  }
};

export const activateAccount = async (userData) => {
  try {
    const response = await api.post("users/activate", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.msg;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("login", credentials);

    // Armazena o token JWT no LocalStorage
    localStorage.setItem("jwtToken", response.data.token);

    // Armazena o papel do usuário (role) para controle de acesso no frontend
    localStorage.setItem("userRole", response.data.user.role);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      const timeoutError = {
        msg: "A API demorou para responder. Por favor, aguarde alguns instantes e tente novamente.",
        isTimeout: true,
      };
      throw timeoutError;
    }

    throw error.response?.data || error.msg;
  }
};

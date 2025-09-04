import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    try {
      const decode = jwtDecode(token);
      return {
        id: decode.id,
        name: decode.name,
        email: decode.email,
        role: decode.role,
        is_active: decode.is_active,
      };
    } catch (error) {
      console.error("Falha ao decodificar o token:", error);
      return null;
    }
  }
};

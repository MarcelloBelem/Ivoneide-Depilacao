import { jwtDecode } from "jwt-decode";

export function isTokenValid(token) {
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
}

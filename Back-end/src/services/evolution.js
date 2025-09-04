import axios from "axios";
import "dotenv/config";
import { formatPhoneNumber } from "../utils/formatPhone.js";

const urlEvolution = process.env.EVOLUTION_SERVER_URL;
const instanceEvolution = process.env.EVOLUTION_SERVER_INSTANCE;
const keyEvolution = process.env.EVOLUTION_SERVER_KEY;

export const messageWhatsapp = async (rawphone, message) => {
  const phone = formatPhoneNumber(rawphone);
  try {
    const response = await axios.post(
      `${urlEvolution}/message/sendText/${instanceEvolution}`,
      { number: phone, text: message },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: keyEvolution,
        },
      }
    );

    // Se a API retornar explicitamente exists === false, é número inválido
    const msgStatus = response.data?.response?.message?.[0];
    if (msgStatus && msgStatus.exists === false) {
      throw new Error("Número inválido ou não possui WhatsApp");
    }

    return true;
  } catch (error) {
    // Se a API retornar erro HTTP 400 ou outro erro, podemos diferenciar
    if (
      error.response?.status === 400 &&
      error.response.data?.response?.message?.[0]?.exists === false
    ) {
      throw new Error("Número inválido ou não possui WhatsApp");
    }

    // Qualquer outro erro real da requisição
    console.error(
      "Erro ao enviar mensagem:",
      error.response?.data || error.message
    );
    throw new Error("Falha ao enviar mensagem");
  }
};

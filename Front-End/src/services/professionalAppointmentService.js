import api from "./api";

//Resgatar agendamentos pendentes
export const getPendingAppointments = async () => {
  try {
    const response = await api.get("/professional/appointment/pending");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Confirma agendamento pendente
export const confirmAppointment = async (appointmentId) => {
  try {
    const response = await api.patch(
      `/professional/appointment/${appointmentId}/confirm`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Cancelar agendamento
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await api.patch(
      `/professional/appointment/${appointmentId}/cancel`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Resgatar agendamento confirmados
export const getConfirmedAppointments = async () => {
  try {
    const response = await api.get("/professional/appointment/confirmed");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Concluir agendamento
export const completeAppointment = async (appointmentId) => {
  try {
    const response = await api.patch(
      `/professional/appointment/${appointmentId}/complete`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

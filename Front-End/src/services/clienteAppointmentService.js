import api from "./api";

//Criar agendamento
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/appointment", appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.msg;
  }
};

//Resgatar horarios ocupados
export const getProfessionalOccupiedSlots = async (
  professional_id,
  appointment_date,
) => {
  try {
    const response = await api.get("/appointment/professional/occupied-slots", {
      params: { professional_id, appointment_date },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Resgata agendamento(ou agendamentos, função futura) que o cliente possui
export const getAppointments = async () => {
  try {
    const response = await api.get("/client/me/appointment");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Regata agendamento(apenas um)
export const getAppointment = async (appointmentId) => {
  try {
    const response = await api.get("/client/me/appointment", {
      params: appointmentId,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Editar agendamento
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await api.put(
      `/client/me/appointment/${appointmentId}`,
      updateData,
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

//Cancelar Agendamento
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await api.patch(
      `/client/me/appointment/${appointmentId}/cancel`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

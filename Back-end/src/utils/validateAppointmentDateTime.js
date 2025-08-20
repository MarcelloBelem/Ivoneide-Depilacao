// src/utils/validateAppointmentDateTime.js
import { z } from "zod";

export const validateAppointmentDateTime = (data) => {
  const validTimeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  if (!validTimeSlots.includes(data.appointment_time)) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["appointment_time"],
        message:
          "Horário inválido. Os agendamentos devem estar entre 08:00 e 18:00, em horas cheias.",
      },
    ]);
  }

  const combinedDateTimeString = `${data.appointment_date}T${data.appointment_time}:00`;
  const combinedDateTimeWithOffset = `${combinedDateTimeString}-03:00`;
  const appointmentDateTime = new Date(combinedDateTimeWithOffset);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maxDate = new Date(todayStart);
  maxDate.setDate(todayStart.getDate() + 30);
  maxDate.setHours(23, 59, 59, 999);

  const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000);

  if (isNaN(appointmentDateTime.getTime())) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["appointment_date", "appointment_time"],
        message: "Data ou hora combinada resultou em um formato inválido.",
      },
    ]);
  }

  if (appointmentDateTime <= now) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["appointment_date", "appointment_time"], // Ajustei o path para ambos os campos
        message: "Não é possível agendar um horário que já passou.",
      },
    ]);
  }

  if (appointmentDateTime < minBookingTime) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["appointment_time"],
        message:
          "O agendamento deve ser feito com no mínimo 1 hora de antecedência.",
      },
    ]);
  }

  if (appointmentDateTime > maxDate) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["appointment_date"],
        message:
          "O agendamento só pode ser feito com no máximo 30 dias de antecedência.",
      },
    ]);
  }

  return appointmentDateTime; // Retorna o objeto Date validado
};

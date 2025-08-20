import { z } from "zod";
import { validateAppointmentDateTime } from "../utils/validateAppointmentDateTime.js";

export const createAppointmentSchema = z
  .object({
    professional_id: z
      .number()
      .int("ID do profissional deve ser um número inteiro.")
      .positive("ID do profissional inválido."),

    // Campo para a data (ex: "yyyy-mm-dd")
    appointment_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Formato de data inválido. Use YYYY-MM-DD."
      ),

    // Campo para a hora (ex: "hh:mm")
    appointment_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido. Use HH:MM."),

    service_ids: z
      .array(z.number().int("ID de serviço inválido."))
      .min(1, "Selecione pelo menos um serviço."),
  })
  .refine(
    (data) => {
      const validTimes = [
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

      if (!validTimes.includes(data.appointment_time)) {
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
      const appointmentDateTime = new Date(combinedDateTimeString);
      const now = new Date(); // Horário atual do servidor

      // Validação para impedir agendamentos no passado
      // A data/hora do agendamento não pode ser anterior ao momento atual
      if (appointmentDateTime <= now) {
        throw new z.ZodError([
          // Lança um erro Zod específico
          {
            code: z.ZodIssueCode.custom,
            path: ["appointment_date_time"],
            message: "Não é possível agendar um horário que já passou.",
          },
        ]);
      }

      //Agendamento no minimo 1 hora de antecedência
      const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000); // Adiciona 1 hora ao tempo atual
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

      //Inicio do dia atual
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      // Calcula a data máxima permitida (30 dias a partir de hoje)
      const maxDate = new Date(todayStart);
      maxDate.setDate(todayStart.getDate() + 30);
      maxDate.setHours(23, 59, 59, 999); // Garante que inclui o final do dia 30

      // Agendamento no maximo 30 dias
      if (appointmentDateTime > maxDate) {
        throw new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            path: ["appointment_date"], // Aponta o erro para o campo de data
            message:
              "O agendamento só pode ser feito com no máximo 30 dias de antecedência.",
          },
        ]);
      }

      return true; // Se todas as validações passarem
    },
    {
      // A mensagem padrão do refine será sobrescrita pelos erros específicos lançados acima.
      message: "Erro de validação no agendamento.",
      path: ["appointment_date_time"],
    }
  )
  .transform((data) => {
    const combinedDateTimeString = `${data.appointment_date}T${data.appointment_time}:00`;
    const combinedDateTimeWithOffset = `${combinedDateTimeString}-03:00`;
    const appointment_date_time = new Date(combinedDateTimeWithOffset);

    return { ...data, appointment_date_time: appointment_date_time };
  });

export const updateAppointmentSchema = z
  .object({
    appointment_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido. Use AAAA-MM-DD.")
      .optional(), // Data é opcional para update

    appointment_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Formato de hora inválido. Use HH:MM.")
      .optional(), // Hora é opcional para update

    service_ids: z
      .array(
        z.number().int("ID de serviço inválido. Deve ser um número inteiro.")
      )
      .min(1, "Selecione pelo menos um serviço.")
      .optional(), // Serviços são opcionais para update
  })
  .refine(
    (data) => {
      // Se data OU hora forem fornecidas, execute a validação complexa
      if (data.appointment_date || data.appointment_time) {
        validateAppointmentDateTime(data);
      }
      return true; // Se não houver data/hora para validar ou se a validação passar
    },
    {
      // A mensagem padrão do refine será sobrescrita pelos erros específicos lançados pela função utilitária.
      message: "Erro de validação na data/hora do agendamento.",
      path: ["appointment_date", "appointment_time"],
    }
  );

export const getOccupiedSlotsSchema = z.object({
  professional_id: z
    .number()
    .int("ID do profissional deve ser um número inteiro.")
    .positive("ID do profissional inválido."),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido. Use YYYY-MM-DD."),
});

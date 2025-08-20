import { db } from "../models/index.js";
import { z } from "zod";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  getOccupiedSlotsSchema,
} from "../schemas/appointmentSchema.js";
import { validateAppointmentDateTime } from "../utils/validateAppointmentDateTime.js";
import { sequelize } from "../config/database.js";
import pkg from "sequelize";

const { Op } = pkg; // Permite acesso aos operadores do sequelize
const User = db.User; //Acessa o modelo de user do DB
const Appointment = db.Appointment; //Acessa o modelo de appointment do DB
const Service = db.Service; //Acessa o modelo de service do DB
const AppointmentService = db.AppointmentService; // Acessa o modelo de AppointmentService do DB

// Cria agendamento
export const createAppointment = async (req, res) => {
  const clientId = req.user.id;
  try {
    //Validação com ZOD
    const validatedData = createAppointmentSchema.parse(req.body);

    //Destructuring dos dados validados
    const { professional_id, appointment_date_time, service_ids } =
      validatedData;

    //Verificar se cliente tem agendamento ativo
    const activeAppointment = await Appointment.findAll({
      where: {
        client_id: clientId,
        status: ["pending", "confirmed"], // Busca por agendamentos pendentes ou confirmados
      },
    });

    if (activeAppointment.length > 0) {
      return res.status(403).json({
        msg: "Você possui agendamentos pendentes ou confirmados. Por favor, aguarde a conclusão ou cancelamento para criar um novo agendamento.",
      });
    }

    //Verififcar se o horário ja esta ocupado para o profissional selecionado
    const existingAppointment = await Appointment.findOne({
      where: {
        professional_id: professional_id,
        appointment_date_time: appointment_date_time,
        status: ["pending", "confirmed"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        msg: "Este horário já está agendado para o profissional selecionado. Por favor, escolha outro horário.",
      });
    }

    //Verifica se o professional_id existe e é realmente um "role: Professional"
    const professional = await User.findOne({
      where: { id: professional_id, role: "professional" },
    });

    if (!professional) {
      return res
        .status(404)
        .json({ msg: "Profissional não encontrado ou ID inválido." });
    }

    //Verifica se services existem ou estão ativos
    const services = await Service.findAll({
      where: { id: service_ids, is_active: true },
      attributes: ["id", "price"],
    });

    if (services.length !== service_ids.length) {
      return res.status(400).json({
        msg: "Um ou mais serviços são inválidos ou não estão ativos.",
      });
    }

    //Mapeia os serviços para facil acesso aos preços
    const servicesMap = services.reduce((map, service) => {
      map[service.id] = service.price;
      return map;
    }, {});

    const result = await sequelize.transaction(async (t) => {
      //Criar agendamento principal
      const newAppointment = await Appointment.create(
        {
          client_id: clientId,
          professional_id: professional_id,
          appointment_date_time: appointment_date_time,
          status: "pending",
        },
        { transaction: t }
      );

      //Ajusta dados para tabela de junção
      const appointmentServicesData = service_ids.map((serviceId) => ({
        appointment_id: newAppointment.id,
        service_id: serviceId,
        service_price_at_time_of_booking: servicesMap[serviceId],
      }));

      //Inserir os registros na tabela appointment_services
      await AppointmentService.bulkCreate(appointmentServicesData, {
        transaction: t,
      });

      return newAppointment;
    });

    //Resposta de sucesso
    return res.status(201).json({
      msg: "Agendamento criado com sucesso!",
      appointment: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Erro de validação nos dados do agendamento.",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          msg: err.message,
        })),
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        msg: "Já existe um agendamento para este cliente com este profissional neste horário.",
      });
    }

    console.error("Erro ao criar agendamento:", error);
    return res
      .status(500)
      .json({ msg: "Erro interno do servidor ao criar agendamento." });
  }
};

export const getProfessionalOccupiedSlots = async (req, res) => {
  try {
    const rawProfessionalId = req.query.professional_id;
    const rawAppointmentDate = req.query.appointment_date;

    const processedData = {
      professional_id: rawProfessionalId
        ? parseInt(rawProfessionalId, 10)
        : undefined,
      appointment_date: rawAppointmentDate,
    };

    const validateData = getOccupiedSlotsSchema.parse(processedData);

    const { professional_id, appointment_date } = validateData;

    const professional = await User.findOne({
      where: { id: professional_id, role: "professional" },
      attributes: ["id"],
    });

    if (!professional) {
      res.status(404).json({ msg: "Profissional não encontrado." });
    }

    const appointments = await Appointment.findAll({
      where: {
        professional_id: professional_id,
        appointment_date_time: {
          [Op.gte]: `${appointment_date}T00:00:00.000Z`, // Maior ou igual ao início do dia
          [Op.lt]: `${appointment_date}T23:59:59.999Z`, // Menor que o início do próximo dia
        },
        status: ["pending", "confirmed"],
      },
      attributes: ["appointment_date_time"],
    });

    const occupiedTimes = appointments.map((appt) => {
      const dateTime = new Date(appt.appointment_date_time);

      return dateTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Fortaleza",
      });
    });

    const uniqueOccupiedTimes = [...new Set(occupiedTimes)];

    return res.status(200).json({
      msg: `Horários ocupados para o profissional ${professional_id} em ${appointment_date} recuperados com sucesso.`,
      occupiedSlots: uniqueOccupiedTimes.sort(), // Retorna os horários ordenados
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Errors:", error.errors);
      return res.status(400).json({
        msg: "Dados de requisição inválidos para buscar horários ocupados.",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          msg: err.message,
        })),
      });
    }
    console.error("Erro ao buscar horários ocupados:", error);
    return res.status(500).json({
      msg: "Erro interno do servidor ao buscar horários ocupados.",
    });
  }
};
//Client
export const getClientAppointments = async (req, res) => {
  const clientId = req.user.id;

  try {
    const appointments = await Appointment.findAll({
      where: { client_id: clientId, status: ["pending", "confirmed"] },
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: ["service_price_at_time_of_booking"] },
        },
        {
          model: User,
          as: "professional",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["appointment_date_time", "ASC"]],
    });

    if (appointments.length === 0) {
      return res.status(404).json({
        msg: "Nenhum agendamento ativo encontrado para este cliente",
      });
    }

    return res.status(200).json({
      msg: "Agendamentos ativos do cliente recuperados com sucesso!",
      appointments: appointments,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    return res.status(500).json({
      msg: "Erro interno do servidor ao buscar agendamentos do cliente.",
    });
  }
};

export const getClientAppointment = async (req, res) => {
  const { id } = req.params;
  const clientId = req.user.id;

  try {
    const appointment = await Appointment.findOne({
      where: { id: id, client_id: clientId },
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: ["service_price_at_time_of_booking"] },
        },
        {
          model: User,
          as: "professional",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        msg: "Agendamento não encontrado ou você não tem permissão para acessá-lo.",
      });
    }

    return res.status(200).json({
      msg: "Agendamento recuperado com sucesso!",
      appointment: appointment,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamento do cliente:", error);
    return res.status(500).json({
      msg: "Erro interno do servidor ao buscar agendamento do cliente.",
    });
  }
};

export const updateAppointmentByClient = async (req, res) => {
  const { id } = req.params;
  const clientId = req.user.id;

  try {
    const validatedData = updateAppointmentSchema.parse(req.body);

    const { appointment_date, appointment_time, service_ids } = validatedData;

    if (
      !appointment_date &&
      !appointment_time &&
      (!service_ids || service_ids.length === 0)
    ) {
      return res
        .status(400)
        .json({ msg: "Nenhum dado para atualização foi fornecido." });
    }

    const appointment = await Appointment.findOne({
      where: { id: id, client_id: clientId },
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        msg: "Agendamento não encontrado ou você não tem permissão para editá-lo.",
      });
    }

    if (appointment.status !== "pending") {
      const statusMap = {
        pending: "Pendente",
        confirmed: "Confirmado",
        completed: "Concluído",
        cancelled: "Cancelado",
      };

      const statusInPortuguese =
        statusMap[appointment.status] || appointment.status;

      return res.status(403).json({
        msg: `Não é possível alterar agendamentos com status '${statusInPortuguese}'.`,
      });
    }

    let finalAppointmentDateTime = appointment.appointment_date_time;
    let isDateTimeChanged = false;
    let isServicesChanged = false;

    if (appointment_date || appointment_time) {
      const dateToUse =
        appointment_date ||
        appointment.appointment_date_time.toISOString().split("T")[0];
      const timeToUse =
        appointment_time ||
        appointment.appointment_date_time
          .toISOString()
          .split("T")[1]
          .substring(0, 5);

      const newCombinedDateTimeString = `${dateToUse}T${timeToUse}:00`;
      const newCombinedDateTimeWithOffset = `${newCombinedDateTimeString}-03:00`;
      finalAppointmentDateTime = new Date(newCombinedDateTimeWithOffset);

      if (
        finalAppointmentDateTime.getTime() !==
        appointment.appointment_date_time.getTime()
      ) {
        isDateTimeChanged = true;

        const existingConflict = await Appointment.findOne({
          where: {
            professional_id: appointment.professional_id,
            appointment_date_time: finalAppointmentDateTime,
            id: { [Op.ne]: appointment.id }, // Exclui o próprio agendamento da verificação
            status: ["pending", "confirmed"], // Considera apenas slots que estão ativos
          },
        });

        if (existingConflict) {
          return res.status(409).json({
            msg: "O novo horário selecionado já está agendado para o profissional. Por favor, escolha outro horário.",
          });
        }
      }
    }

    if (service_ids && service_ids.length > 0) {
      const currentServicesIds = appointment.services.map((s) => s.id).sort();

      const newServicesIdsSorted = service_ids.sort();

      if (
        JSON.stringify(currentServicesIds) !==
        JSON.stringify(newServicesIdsSorted)
      ) {
        isServicesChanged = true;
      }
    }

    if (!isDateTimeChanged && !isServicesChanged) {
      return res.status(200).json({
        msg: "Nenhuma mudança detectada. Agendamento não atualizado.",
        appointment: appointment,
      });
    }

    const result = await sequelize.transaction(async (t) => {
      if (appointment_date || appointment_time) {
        await appointment.update(
          {
            appointment_date_time: finalAppointmentDateTime,
          },
          { transaction: t }
        );
      }

      if (isServicesChanged) {
        await AppointmentService.destroy({
          where: { appointment_id: appointment.id },
          transaction: t,
        });

        const newServices = await Service.findAll({
          where: { id: service_ids, is_active: true },
          attributes: ["id", "price"],
        });

        if (newServices.length !== service_ids.length) {
          throw new Error(
            "Um ou mais novos serviços são inválidos ou não estão ativos."
          );
        }

        const newServicesMap = newServices.reduce((map, service) => {
          map[service.id] = service.price;
          return map;
        }, {});

        const newAppointmentServicesData = service_ids.map((serviceId) => ({
          appointment_id: appointment.id,
          service_id: serviceId,
          service_price_at_time_of_booking: newServicesMap[serviceId],
        }));

        // Inserir os novos registros na tabela appointment_services
        await AppointmentService.bulkCreate(newAppointmentServicesData, {
          transaction: t,
        });
      }

      const updateAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Service,
            as: "services",
            through: { attributes: ["service_price_at_time_of_booking"] },
          },
          {
            model: User,
            as: "client",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "professional",
            attributes: ["id", "name", "email"],
          },
        ],
        transaction: t,
      });

      return updateAppointment;
    });

    return res.status(200).json({
      msg: "Agendamento atualizado com sucesso!",
      appointment: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Erro de validação nos dados de atualização do agendamento.",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        msg: "Já existe um agendamento com os mesmos dados que você está tentando criar/atualizar.",
      });
    }
    console.error("Erro ao atualizar agendamento do cliente:", error);
    return res
      .status(500)
      .json({ msg: "Erro interno do servidor ao atualizar agendamento." });
  }
};

export const cancelAppointmentByClient = async (req, res) => {
  const { id } = req.params;
  const clientId = req.user.id;

  try {
    const appointment = await Appointment.findOne({
      where: { id: id, client_id: clientId },
    });

    if (!appointment) {
      return res.status(404).json({
        msg: "Agendamento não encontrado ou você não tem permissão para cancelá-lo.",
      });
    }

    if (appointment.status === "cancelled") {
      return res
        .status(400)
        .json({ msg: "Este agendamento já está cancelado." });
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "confirmed"
    ) {
      return res.status(400).json({
        msg: "Não é possível cancelar um agendamento já concluído ou confirmado.",
      });
    }

    await sequelize.transaction(async (t) => {
      await appointment.update({ status: "cancelled" }, { transaction: t });
    });

    return res
      .status(200)
      .json({ msg: "Agendamento cancelado com sucesso.", appointment: id });
  } catch (error) {
    console.error("Erro ao cancelar agendamento do cliente", error);
    return res
      .status(500)
      .json({ msg: "Erro interno do servidor ao cancelar agendamento." });
  }
};

//Professional
export const getProfessionalPendingAppointments = async (req, res) => {
  const professionalId = req.user.id;

  try {
    const appointments = await Appointment.findAll({
      where: { professional_id: professionalId, status: "pending" },
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: ["service_price_at_time_of_booking"] },
        },
        { model: User, as: "client", attributes: ["id", "name", "email"] },
      ],
      order: [["appointment_date_time", "ASC"]],
    });

    if (appointments.length === 0) {
      return res.status(404).json({
        msg: "Nenhum agendamento pendente encontrado para este profissional.",
      });
    }

    return res.status(200).json({
      msg: "Agendamentos pendentes do profissional recuperados com sucesso!",
      appointments: appointments,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar agendamentos pendentes do profissional:",
      error
    );
    return res.status(500).json({
      msg: "Erro interno do servidor ao buscar agendamentos pendentes do profissional.",
    });
  }
};

export const getProfessionalConfirmedAppointments = async (req, res) => {
  const professionalId = req.user.id;

  try {
    const appointments = await Appointment.findAll({
      where: { professional_id: professionalId, status: "confirmed" },
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: ["service_price_at_time_of_booking"] },
        },
        { model: User, as: "client", attributes: ["id", "name", "email"] },
      ],
      order: [["appointment_date_time", "ASC"]],
    });

    if (appointments.length === 0) {
      res.status(404).json({
        msg: "Nenhum agendamento confirmado encontrado para este profissional.",
      });
    }

    return res.status(200).json({
      msg: "Agendamentos confirmados do profissional recuperados com sucesso!",
      appointments: appointments,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar agendamentos pendentes do profissional:",
      error
    );
    return res.status(500).json({
      msg: "Erro interno do servidor ao buscar agendamentos pendentes do profissional.",
    });
  }
};

export const confirmAppointmentByProfessional = async (req, res) => {
  const { id } = req.params;
  const professionalId = req.user.id;

  try {
    const appointment = await Appointment.findOne({
      where: { id: id, professional_id: professionalId },
    });

    if (!appointment) {
      return res.status(404).json({
        msg: "Agendamento não encontrado ou você não tem permissão para confirmá-lo.",
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        msg: `Não é possível confirmar agendamentos com status '${appointment.status}'. Somente agendamentos 'pending' podem ser confirmados.`,
      });
    }

    await sequelize.transaction(async (t) => {
      await appointment.update({ status: "confirmed" }, { transaction: t });
    });

    const updateAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: ["service_price_at_time_of_booking"] },
        },
        {
          model: User,
          as: "client",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "professional",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      msg: "Agendamento confirmado com sucesso!",
      appointment: updateAppointment,
    });
  } catch (error) {
    console.error("Erro ao confirmar agendamento pelo profissional:", error);
    return res
      .status(500)
      .json({ msg: "Erro interno do servido para confirmar agendamento" });
  }
};

export const completeAppointmentByProfessional = async (req, res) => {
  const { id } = req.params;
  const professionalId = req.user.id;

  try {
    const appointment = await Appointment.findOne({
      where: { id: id, professional_id: professionalId },
    });

    if (!appointment) {
      return res.status(404).json({
        msg: "Agendamento não encontrado ou você não tem permissão para concluí-lo.",
      });
    }

    if (appointment.status === "completed") {
      return res
        .status(400)
        .json({ msg: "Este agendamento já está concluído." });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        msg: `Não é possível concluir agendamentos com status '${appointment.status}'. Somente agendamentos 'confirmed' podem ser concluídos`,
      });
    }

    await sequelize.transaction(async (t) => {
      await appointment.update({ status: "completed" }, { transaction: t });
    });

    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: ["service_price_at_time_of_booking"] },
        },
        {
          model: User,
          as: "client",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "professional",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      msg: "Agendamento concluído com sucesso!",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Erro ao concluir agendamento pelo profissional:", error);
    return res.status(500).json({
      msg: "Erro interno do servidor ao concluir agendamento.",
    });
  }
};

export const cancelAppointmentByProfessional = async (req, res) => {
  const { id } = req.params;
  const professionalId = req.user.id;

  try {
    const appointment = await Appointment.findOne({
      where: { id: id, professional_id: professionalId },
    });

    if (!appointment) {
      return res.status(404).json({
        msg: "Agendamento não encontrado ou você não tem permissão para cancelá-lo.",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        msg: "Este agendamento já está cancelado.",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        msg: "Não é possível cancelar um agendamento já concluído.",
      });
    }

    await sequelize.transaction(async (t) => {
      await appointment.update({ status: "cancelled" }, { transaction: t });
    });

    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: ["service_price_at_time_of_booking"] },
        },
        {
          model: User,
          as: "client",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "professional",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      msg: "Agendamento cancelado com sucesso pelo profissional!",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento pelo profissional:", error);
    return res.status(500).json({
      message: "Erro interno do servidor ao cancelar agendamento.",
    });
  }
};

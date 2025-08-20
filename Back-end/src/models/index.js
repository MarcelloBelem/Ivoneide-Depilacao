import { sequelize } from "../config/database.js";
import User from "./User.js";
import Service from "./service.js";
import Appointment from "./Appointment.js";
import AppointmentService from "./AppointmentService.js";

//Um usuário (client) pode varios agendamenmtos
User.hasMany(Appointment, {
  foreignKey: "client_id",
  as: "clientAppointments",
});
Appointment.belongsTo(User, { foreignKey: "client_id", as: "client" });

// Um usuário (professional) pode ter muitos agendamentos (que ele atende)
User.hasMany(Appointment, {
  foreignKey: "professional_id",
  as: "professionalAppointments",
});
Appointment.belongsTo(User, {
  foreignKey: "professional_id",
  as: "professional",
});

/// Relação N:M entre Appointment e Service através de AppointmentService

// Um agendamento tem muitos serviços (através da tabela de junção)
Appointment.belongsToMany(Service, {
  through: AppointmentService,
  foreignKey: "appointment_id",
  otherKey: "service_id",
  as: "services",
});

// Um serviço pode estar em muitos agendamentos (através da tabela de junção)
Service.belongsToMany(Appointment, {
  through: AppointmentService,
  foreignKey: "service_id",
  otherKey: "appointment_id",
  as: "appointments",
});

// Associações diretas para a tabela de junção se precisar acessá-la diretamente
AppointmentService.belongsTo(Appointment, { foreignKey: "appointment_id" });
AppointmentService.belongsTo(Service, { foreignKey: "service_id" });

const db = {
  sequelize,
  User,
  Service,
  Appointment,
  AppointmentService,
};

export { db }; // Exporta o objeto 'db' com todos os modelos

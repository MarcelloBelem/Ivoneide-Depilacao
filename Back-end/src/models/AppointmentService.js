import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const AppointmentService = sequelize.define(
  "AppointmentService",
  {
    appointment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    service_price_at_time_of_booking: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "appointment_services",
    timestamps: true,
    underscored: true,
  }
);

export default AppointmentService;

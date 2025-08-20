import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    professional_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    appointment_date_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    tableName: "appointments",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["client_id", "professional_id", "appointment_data_time"],
        name: "unique_appointment_per_client_professional_time",
      },
    ],
  }
);

export default Appointment;

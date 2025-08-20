// src/migrations/20250624235721-create-appointments-table.js

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { Op } = Sequelize;

    // Cria o ENUM
    await queryInterface.sequelize.query(
      "CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');"
    );

    await queryInterface.createTable("appointments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      professional_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      appointment_date_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: "appointment_status",
        defaultValue: "pending",
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    //CRIA O ÍNDICE ÚNICO PARCIAL VIA SQL DIRETO
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "unique_active_appointment_per_client_professional_time"
      ON "appointments" ("client_id", "professional_id", "appointment_date_time")
      WHERE (status = 'pending' OR status = 'confirmed');
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove o índice único parcial via SQL direto
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "unique_active_appointment_per_client_professional_time";
    `);

    // Apaga a tabela appointments
    await queryInterface.dropTable("appointments");
    // Apaga o ENUM appointment_status
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS appointment_status;"
    );
  },
};

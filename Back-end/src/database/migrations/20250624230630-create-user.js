"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //Cria o Enum
    await queryInterface.sequelize.query(
      "CREATE TYPE user_role AS ENUM ('client', 'professional');"
    );

    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: "user_role",
        allowNull: false,
        defaultValue: "client",
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");

    await queryInterface.sequelize.query("DROP TYPE IF EXISTS user_role;");
  },
};

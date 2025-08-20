"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("services", [
      {
        name: "Buço",
        price: 800,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Linha Abdominal",
        price: 700,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Axila",
        price: 1700,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Barriga",
        price: 1200,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Meia-Perna",
        price: 2500,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Perna Completa",
        price: 4000,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Braço",
        price: 2500,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Virilha",
        price: 4000,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("services", null, {});
  },
};

// Este arquivo config.js é para o sequelize-cli
require("dotenv").config(); // Carrega as variáveis de ambiente com CommonJS

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  // Adicione aqui configuracoes para 'test' e 'production' se precisar
  test: {},
  production: {},
};

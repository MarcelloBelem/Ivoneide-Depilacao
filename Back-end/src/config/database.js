import { Sequelize } from "sequelize";
import "dotenv/config"; // Importa e carrega as variáveis de ambiente

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false, // Defina como true para ver os logs SQL
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
});

// Testar a conexão
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
  } catch (error) {
    console.error("Não foi possível conectar ao banco de dados:", error);
  }
}

export { sequelize, connectDB };

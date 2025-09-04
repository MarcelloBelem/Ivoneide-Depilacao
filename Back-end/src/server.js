import express from "express";
import cors from "cors";
import Sequilize from "sequelize";
import { connectDB } from "./config/database.js";
import allRoutes from "./routes/index.js";

//Const que chama o express
const app = express();

app.use(cors({}));

//Define a ultilização de JSON
app.use(express.json());

app.use("/api", allRoutes);

async function startServer() {
  await connectDB();

  app.listen(3030, () => console.log(`SERVIDOR ON`));
}

startServer();

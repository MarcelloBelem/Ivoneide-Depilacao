//Centraizar as rotas pub e priv
import express from "express";
import privateRoutes from "./privateRoutes.js";
import publicRoutes from "./publicRoutes.js";

const router = express.Router();

//Rotas publicas
router.use("/", publicRoutes);

//Rotas privadas
router.use("/", privateRoutes);

export default router;

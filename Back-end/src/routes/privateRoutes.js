import express from "express";
import {
  authenticateToken,
  authorizeProfessional,
  authorizeClient,
} from "../middlewares/authMiddleware.js";
import {
  createAppointment,
  getProfessionalOccupiedSlots,
  getClientAppointments,
  getClientAppointment,
  updateAppointmentByClient,
  cancelAppointmentByClient,
  getProfessionalPendingAppointments,
  getProfessionalConfirmedAppointments,
  confirmAppointmentByProfessional,
  completeAppointmentByProfessional,
  cancelAppointmentByProfessional,
} from "../controllers/appointmentController.js";

const router = express.Router();
router.use(authenticateToken);

//Agendar horário
router.post("/appointment", authorizeClient, createAppointment);
router.get(
  "/appointment/professional/occupied-slots",
  authorizeClient,
  getProfessionalOccupiedSlots
);

//Cliente
router.get("/client/me/appointment", authorizeClient, getClientAppointments);
router.get("/client/me/appointment/:id", authorizeClient, getClientAppointment);
router.put(
  "/client/me/appointment/:id",
  authorizeClient,
  updateAppointmentByClient
);
router.patch(
  "/client/me/appointment/:id/cancel",
  authorizeClient,
  cancelAppointmentByClient
);

//Professional
router.get(
  "/professional/appointment/pending",
  authorizeProfessional,
  getProfessionalPendingAppointments
);
router.get(
  "/professional/appointment/confirmed",
  authorizeProfessional,
  getProfessionalConfirmedAppointments
);
router.patch(
  "/professional/appointment/:id/confirm",
  authorizeProfessional,
  confirmAppointmentByProfessional
);

router.patch(
  "/professional/appointment/:id/complete",
  authorizeProfessional,
  completeAppointmentByProfessional
);

router.patch(
  "/professional/appointment/:id/cancel",
  authorizeProfessional,
  cancelAppointmentByProfessional
);

export default router;

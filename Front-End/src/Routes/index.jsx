import React from "react";
import { Routes, Route } from "react-router";
import PrivateRoutes from "./PrivateRoutes";
import PublicRoutes from "./PublicRoutes";

//Paginas
/// Publicas
import Login from "../pages/Public/Login";
import Register from "../pages/Public/Register/Register";
import ForgotPassword from "../pages/Public/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/Public/ForgotPassword/ResetPassword";

/// Privadas
//// Cliente
import MyAppointments from "../pages/Private/Client/MyAppointments";
import ScheduleAppointment from "../pages/Private/Client/ScheduleAppointment";
import EditAppointment from "../pages/Private/Client/EditAppointment";

//// Profissional
import Agenda from "../pages/Private/Professional/Agenda";
import AppointmentRequests from "../pages/Private/Professional/AppointmentRequests";

// NotFound
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Login />} />
        <Route path="/Cadastro" element={<Register />} />
        <Route path="/EsqueceuSenha" element={<ForgotPassword />} />
        <Route path="/RedefinirSenha" element={<ResetPassword />} />
      </Route>

      <Route element={<PrivateRoutes />}>
        {/*Cliente*/}
        <Route path="/MeusAgendamentos" element={<MyAppointments />} />
        <Route path="/EditarAgendamento/:id" element={<EditAppointment />} />
        <Route path="/AgendarHorario" element={<ScheduleAppointment />} />

        {/*Profissional*/}
        <Route path="/Agenda" element={<Agenda />} />
        <Route path="/Solicitacoes" element={<AppointmentRequests />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

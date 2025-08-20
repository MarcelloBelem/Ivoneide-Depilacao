import React from "react";
import { Navigate, Outlet } from "react-router";

const PublicRoutes = () => {
  const isAuthenticated = !!localStorage.getItem("jwtToken");
  const role = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return <Outlet />;
  }

  if (role === "client") {
    return <Navigate to="/MeusAgendamentos" />;
  } else if (role === "professional") {
    return <Navigate to="/Agenda" />;
  } else {
    return <Navigate to="/" />;
  }
};

export default PublicRoutes;

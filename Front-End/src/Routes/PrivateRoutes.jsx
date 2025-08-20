import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { isTokenValid } from "../utils/checkToken";

//Rotas permitidas por tipo de usuários
const allowedRoutes = {
  client: ["/MeusAgendamentos", "/EditarAgendamento", "/AgendarHorario"],
  professional: ["/Agenda", "/Solicitacoes"],
};

const fallbackRoutes = {
  client: "/MeusAgendamentos",
  professional: "/Agenda",
};

const PrivateRoutes = () => {
  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("userRole");
  const location = useLocation();
  const currentPath = location.pathname;

  //Sem token leva para rota login
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    return <Navigate to="/" replace />;
  }

  //Verifica se o usuário tem permissão para acessar a rota atual
  const isAllowed = allowedRoutes[role]?.some((route) =>
    currentPath.startsWith(route),
  );

  //Se não tiver permissão, redireciona para a rota padrão do tipo de usuário
  if (!isAllowed) {
    const fallbackPath = fallbackRoutes[role] || "/";

    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default PrivateRoutes;

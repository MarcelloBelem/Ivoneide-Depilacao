import jwt from "jsonwebtoken";
import "dotenv";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        msg: "Token é inválido",
      });
    }

    req.user = user;
    next();
  });
};

// Middleware para verificar se o usuário é um profissional
export const authorizeProfessional = (req, res, next) => {
  if (!req.user || req.user.role !== "professional") {
    return res.status(403).json({ msg: "Acesso negado" });
  }
  next(); //Prossegue se for profissional
};

// Middleware para verificar se o usuário é um cliente
export const authorizeClient = (req, res, next) => {
  if (!req.user || req.user.role !== "client") {
    return res.status(403).json({ msg: "Acesso negado" });
  }

  next(); //Prossegue se for cliente
};

// Middleware para verificar se o usuário é cliente OU profissional (ex: para listar serviços)
export const authorizeClientOrProfessional = (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== "client" && req.user.role !== "professional")
  ) {
    return res.status(403).json({ msg: "Acesso negado" });
  }
  next();
};

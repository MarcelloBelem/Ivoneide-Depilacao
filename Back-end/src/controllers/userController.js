import { db } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createUserSchema, loginUserSchema } from "../schemas/userSchema.js";

const User = db.User; //Acessa o modelo de user do DB

//Controlador para criar usuário
export const createUser = async (req, res) => {
  try {
    //Validação com o ZOD
    const validateData = createUserSchema.parse(req.body);

    //Destructuring dos dados validados
    const { name, email, password, role } = validateData;

    //Verificar se E-mail já existe no DB
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ msg: "E-mail já cadastrado" });
    }

    //Transformando a senha em Hash
    const password_hash = await bcrypt.hash(password, 10);

    //Criando usuário para o DB
    const newUser = await User.create({
      name,
      email,
      password_hash,
      role,
    });

    //Resposta de sucesso
    res.status(201).json({
      msg: "Usuário criado com sucesso!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Dados de requisição inválidos.",
        errors: error.errors,
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        msg: "E-mail já cadastrado ou outro campo único duplicado.",
      });
    }
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ msg: "Erro interno do servidor." });
  }
};

export const loginUser = async (req, res) => {
  try {
    //Validação com ZOD
    const validateData = loginUserSchema.parse(req.body);

    //Destructuring dos dados validados
    const { email, password } = validateData;

    //Procurar Usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        msg: "E-mail inválido",
      });
    }

    //Verifica a senha enviada com o hash armazenado
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Senha inválida" });
    }

    //Gera o token JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    //Retorna resposta de sucesso com o token
    res.status(200).json({
      msg: "Login bem-sucedido!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    //Se o erro for do ZOD
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Dados de requisição inválidos.",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          msg: err.message,
        })),
      });
    }
    //Erros gerais do servidor
    console.error("Erro no login:", error);
    res.status(500).json({ msg: "Erro interno do servidor." });
  }
};

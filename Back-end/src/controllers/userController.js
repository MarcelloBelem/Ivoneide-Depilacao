import { db } from "../models/index.js";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  createUserSchema,
  activateAccountSchema,
  loginUserSchema,
} from "../schemas/userSchema.js";
import { messageWhatsapp } from "../services/evolution.js";
import { formatPhoneNumber } from "../utils/formatPhone.js";

const User = db.User; //Acessa o modelo de user do DB

//Controlador para criar usuário
export const createUser = async (req, res) => {
  //Função para gerar código com 6 digitos
  const generateActivationCode = async () => {
    let code;
    let exists = true;

    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      // Verifica se já existe algum usuário com este código
      const userWithCode = await User.findOne({
        where: { activation_code: code },
      });
      if (!userWithCode) exists = false;
    }

    return code;
  };

  try {
    //Validação com o ZOD
    const validateData = createUserSchema.parse(req.body);

    //Destructuring dos dados validados
    const { name, email, phone_number, password, role } = validateData;

    const formatedPhoneNumber = formatPhoneNumber(phone_number);

    //Verificar se E-mail já existe no DB
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ msg: "E-mail já cadastrado" });
    }

    //Verificar se Telefone já existe no DB
    const existingPhoneNumber = await User.findOne({
      where: { phone_number: formatedPhoneNumber },
    });
    if (existingPhoneNumber) {
      return res.status(409).json({ msg: "Telefone já cadastrado" });
    }

    //Criar código de ativação
    const activationCode = await generateActivationCode();

    const messageWhats = `Olá ${name}! ✨
Sua conta no nosso site de depilação foi criada com sucesso! 
Para começar a cuidar de você, use o código de ativação abaixo:

${activationCode}

Estamos ansiosos para te receber e deixar sua experiência ainda mais especial! 💖

link para ativação: ${process.env.FRONTEND_URL}AtivarConta/?email=${email}`;

    try {
      //Envia mensagem no Whatsapp
      await messageWhatsapp(formatedPhoneNumber, messageWhats);
    } catch (err) {
      if (err.message === "Número inválido ou não possui WhatsApp") {
        return res.status(400).json({ msg: err.message });
      }
      console.error("Erro ao enviar mensagem:", err);
      return res.status(500).json({ msg: "Erro interno do servidor." });
    }

    //Transformando a senha em Hash
    const password_hash = await bcrypt.hash(password, 10);

    //Criando usuário para o DB
    const newUser = await User.create({
      name,
      email,
      phone_number: formatedPhoneNumber,
      password_hash,
      role,
      activation_code: activationCode,
      is_active: false,
    });

    //Resposta de sucesso
    res.status(201).json({
      msg: "Usuário criado com sucesso!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        formatedPhoneNumber: newUser.phone_number,
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

export const activateAccount = async (req, res) => {
  try {
    const validateData = activateAccountSchema.parse(req.body);

    const { email, activation_code } = validateData;

    //Procurar Usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        msg: "E-mail inválido",
      });
    }

    if (user.is_active) {
      return res.status(400).json({
        msg: "Usuário já está ativo",
      });
    }

    if (user.activation_code !== activation_code) {
      return res.status(400).json({
        msg: "Código inválido ou expirado",
      });
    }

    user.is_active = true;
    await user.save();

    return res.status(200).json({ msg: "Conta ativada com sucesso!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: "Dados inválidos",
        errors: error.errors,
      });
    }
    console.error("Erro ao ativar conta:", error);
    return res.status(500).json({ msg: "Erro interno do servidor" });
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

    if (!user.is_active) {
      return res.status(403).json({
        msg: "Conta não ativada. Verifique seu whatsapp para ativar sua conta.",
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
        phone_number: user.phone_number,
        role: user.role,
        is_active: user.is_active,
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
        is_active: user.is_active,
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

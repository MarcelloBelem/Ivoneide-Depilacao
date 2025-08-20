import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string({
      required_error: "Nome é obrigatorio",
    })
    .min(3, { msg: "Nome deve ter pelo menos 3 caracteres." })
    .max(255, { msg: "Nome deve ter no máximo 255 caracteres." }),

  email: z
    .string({
      required_error: "E-mail é obrigatório",
    })
    .email({ msg: "Formato de e-mail inválido." })
    .max(255, { message: "E-mail deve ter no máximo 255 caracteres." }),

  password: z
    .string({
      required_error: "Senha é obrigatória.",
    })
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres." })
    .max(100, { message: "Senha deve ter no máximo 100 caracteres." }),

  role: z
    .enum(["client", "professional"], {
      invalid_type_error: "Role deve ser 'client' ou 'professional'.",
    })
    .default("client")
    .optional(),
});

export const loginUserSchema = z.object({
  email: z
    .string()
    .email({ message: "Formato de e-mail inválido." })
    .nonempty("E-mail não pode ser vazio."),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres." })
    .nonempty("Senha não pode ser vazia."),
});

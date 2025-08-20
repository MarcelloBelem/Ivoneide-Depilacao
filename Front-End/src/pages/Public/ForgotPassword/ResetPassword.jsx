import React from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";

//Componentes
import Logo from "../../../components/Logo";
import ImgDepilando from "../../../components/ImgDepilando";
import FloatingInput from "../../../components/FloatingInput";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordWatch = watch("password"); // Permite o input confirmPassword "ver" o input password para validação

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="bg-primary flex h-dvh flex-col items-center justify-center gap-3 pt-3">
      <Logo />
      <ImgDepilando />
      <form
        className="flex w-full flex-1 flex-col items-center gap-7 rounded-t-3xl bg-white py-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-primary font-playfair text-center text-3xl font-extrabold">
          Redefinir Senha!
        </h1>

        <div className="flex flex-col gap-5">
          <FloatingInput
            id="password"
            label="Senha"
            type="password"
            error={errors.password}
            {...register("password", {
              required: "Senha é obrigatória",
              maxLength: { value: 15, message: "Máximo 15 caracteres" },
              minLength: { value: 5, message: "Mínimo 5 caracteres" },
            })}
          />

          <FloatingInput
            id="ConfirmPassword"
            label="Confirmar Senha"
            type="password"
            error={errors.confirmPassword}
            {...register("confirmPassword", {
              required: "Confirmação de senha é obrigatória",
              validate: (value) =>
                value === passwordWatch || "As senhas não coincidem",
            })}
          />
        </div>

        <button
          type="submit"
          className="font-lato bg-primary hover:bg-secondary rounded-2xl px-20 py-5 text-xl text-white"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;

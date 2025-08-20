import React from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";

//Componentes
import Logo from "../../../components/Logo";
import ImgDepilando from "../../../components/ImgDepilando";
import FloatingInput from "../../../components/FloatingInput";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
          Esqueceu sua senha?
        </h1>

        <p className="text-primary text-center">
          <strong>Função em desenvolvimento! </strong>Entre em contato com um
          profissional!
        </p>

        {/*         <p className="text-primary text-center">
          Um e-mail será enviado com instruções para redefinir sua senha
        </p>

        <div className="flex flex-col gap-5">
          <FloatingInput
            id="user"
            label="Usuário"
            type="text"
            error={errors.user}
            {...register("user", {
              required: "Usuário é obrigatório",
              maxLength: { value: 35, message: "Máximo 35 caracteres" },
              minLength: { value: 3, message: "Minimo 3 caracteres" },
            })}
          />

          <FloatingInput
            id="email"
            label="Email"
            type="email"
            error={errors.email}
            {...register("email", {
              required: "Email é obrigatório",
              maxLength: { value: 100, message: "Máximo 100 caracteres" },
              minLength: { value: 5, message: "Minimo 5 caracteres" },
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
                message: "Email inválido",
              },
            })}
          />
        </div>

        <button
          type="submit"
          className="font-lato bg-primary hover:bg-secondary rounded-2xl px-20 py-5 text-xl text-white"
        >
          Enviar
        </button> */}
      </form>
    </div>
  );
};

export default ForgotPassword;

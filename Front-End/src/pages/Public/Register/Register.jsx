import { React, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { registerUser } from "../../../services/authServices";
import { formatWhatsapp } from "../../../utils/formatWhatsapp.js";

//Componentes
import Logo from "../../../components/Logo";
import FloatingInput from "../../../components/FloatingInput";
import Alert from "../../../components/Alert";
import Loading from "../../../components/Loading";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const passwordWatch = watch("password"); // Permite o input confirmPassword "ver" o input password para validação

  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await registerUser({
        name: data.user,
        email: data.email,
        password: data.password,
        role: "client",
        phone_number: data.whatsapp.replace(/\D/g, ""),
      });

      console.log("Registro bem-sucedido:", response);
      setAlertText("Cadastrado com sucesso!");
      setAlertType("success");
      setShowAlert(true);

      setTimeout(() => {
        setLoading(false);
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      const errorMessage =
        error.msg || "Erro ao cadastrar. Verifique os dados.";
      setAlertText(errorMessage);
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary relative flex h-dvh flex-col items-center justify-between pt-3">
      {loading && <Loading />}

      {showAlert && (
        <div
          style={{
            position: "fixed",
            zIndex: 10000,
            top: 20,
            left: 0,
            width: "100vw",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Alert
            show={showAlert}
            text={alertText}
            type={alertType}
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}
      <div className="flex size-full items-center justify-center">
        <Logo />
      </div>
      <form
        className="flex w-full flex-col items-center justify-around gap-5 rounded-t-3xl bg-white py-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-primary font-playfair text-center text-3xl font-extrabold">
          Seja Bem-Vindo(a)!
        </h1>

        <div className="flex flex-col items-center gap-5">
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

            <FloatingInput
              id="whatsapp"
              label="Número do WhatsApp"
              type="text"
              error={errors.whatsapp}
              {...register("whatsapp", {
                required: "WhatsApp é obrigatório",
                pattern: {
                  value: /^\(\d{2}\) 9 \d{4}-\d{4}$/,
                  message: "Número inválido",
                },
                onChange: (e) => {
                  e.target.value = formatWhatsapp(e.target.value);
                },
              })}
            />

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
              id="confirmPassword"
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
            Login
          </button>
          <p className="font-raleway text-base font-bold">
            Possui uma conta?{" "}
            <Link
              to="/"
              className="text-primary hover:text-secondary font-bold italic"
            >
              Clique Aqui!
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;

import { React, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { loginUser } from "../../services/authServices";

//Componentes
import Logo from "../../components/Logo";
import ImgDepilando from "../../components/ImgDepilando";
import FloatingInput from "../../components/FloatingInput";
import Alert from "../../components/Alert";
import Loading from "../../components/Loading";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setShowAlert(false);
    setAlertText("");
    setAlertType("");

    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      console.log("Login bem-sucedido:", response);
      setAlertText("Login realizado com sucesso!");
      setAlertType("success");
      setShowAlert(true);

      const userRole = localStorage.getItem("userRole");
      if (userRole === "professional") {
        navigate("/Agenda");
      } else {
        navigate("/MeusAgendamentos");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      const errorMessage =
        error.msg || "Erro ao fazer login. Verifique o email e a senha.";
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
        <Alert
          show={showAlert}
          text={alertText}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="flex size-full flex-col items-center justify-center gap-5">
        <Logo />
        <ImgDepilando />
      </div>
      <form
        className="flex w-full flex-col items-center justify-around gap-5 rounded-t-3xl bg-white py-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-primary font-playfair text-center text-3xl font-extrabold">
          Bem-Vindo(a) Novamente!
        </h1>

        <div className="flex flex-col items-center gap-5">
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
            id="password"
            label="Senha"
            type="password"
            error={errors.password}
            {...register("password", {
              required: "Senha é obrigatório",
              maxLength: { value: 15, message: "Máximo 15 caracteres" },
              minLength: { value: 5, message: "Minimo 5 caracteres" },
            })}
          />
          <Link
            to="EsqueceuSenha"
            className="text-primary hover:text-secondary text-base font-bold italic"
          >
            Esqueceu sua senha?
          </Link>
          <button
            type="submit"
            className="font-lato bg-primary hover:bg-secondary rounded-2xl px-20 py-5 text-xl text-white"
          >
            Login
          </button>
          <p className="font-raleway text-base font-bold">
            Não possui uma conta?{" "}
            <Link
              to="Cadastro"
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

export default Login;

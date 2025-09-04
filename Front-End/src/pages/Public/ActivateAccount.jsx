import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { activateAccount } from "../../services/authServices";

//Componentes
import Logo from "../../components/Logo";
import ImgDepilando from "../../components/ImgDepilando";
import FloatingInput from "../../components/FloatingInput";
import Alert from "../../components/Alert";
import Loading from "../../components/Loading";

const ActivateAccount = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const emailFromURL = searchParams.get("email") || "";

  useEffect(() => {
    if (emailFromURL) {
      setValue("email", emailFromURL);
    }
  }, [emailFromURL, setValue]);

  const onSubmit = async (data) => {
    console.log(data);
    setLoading(true);

    try {
      const response = await activateAccount({
        email: data.email,
        activation_code: data.activation_code,
      });

      console.log("Conta Ativada:", response);
      setAlertText("Conta ativada com sucesso");
      setAlertType("success");
      setShowAlert(true);

      setTimeout(() => {
        setLoading(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Erro ao ativar a conta:", error);
      const errorMessage =
        error.msg || "Erro ao ativar a conta. Verifique o código.";
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
          Estamos quase prontos! Confirme seu número com o código.
        </h1>

        <div className="flex flex-col items-center gap-5">
          <FloatingInput
            id="email"
            label="Email"
            type="email"
            readOnly
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
            id="activation_code"
            label="Código"
            type="code"
            error={errors.activation_code}
            {...register("activation_code", {
              required: "Código é obrigatório",
              maxLength: { value: 6, message: "Máximo 6 caracteres" },
              minLength: { value: 6, message: "Minimo 6 caracteres" },
            })}
          />

          <button
            type="submit"
            className="font-lato bg-primary hover:bg-secondary rounded-2xl px-10 py-5 text-base text-white"
          >
            Ativar Conta
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivateAccount;

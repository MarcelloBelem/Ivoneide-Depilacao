import { React, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import {
  updateAppointment,
  getProfessionalOccupiedSlots,
} from "../../../../services/clienteAppointmentService";

//Components
import TopBar from "../../../../components/TopBar";
import Alert from "../../../../components/Alert";
import Loading from "../../../../components/Loading";
//Lucide
import { ArrowLeft } from "lucide-react";

const index = () => {
  const { id } = useParams();

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ]; //BACKEND - futuro

  const services = [
    { id: 1, name: "Buço" },
    { id: 2, name: "Linha Abdominal" },
    { id: 3, name: "Axila" },
    { id: 4, name: "Barriga" },
    { id: 5, name: "Meia-Perna" },
    { id: 6, name: "Perna Completa" },
    { id: 7, name: "Braço" },
    { id: 8, name: "Virilha" },
  ]; //BACKEND - Futuro

  const navigate = useNavigate();

  // Definir data para agendamento
  const minDate = new Date(); //Data atual
  const maxDate = new Date();
  maxDate.setDate(minDate.getDate() + 30); //Data maxima, da data atual mais 30 dias

  // Função para formatar a data no padrão yyyy-mm-dd
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  //Aplica a função acima
  const formattedMinDate = formatDate(minDate);
  const formattedMaxDate = formatDate(maxDate);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: formattedMinDate,
      services: [],
      time: "",
    },
  });

  const selectedServices = watch("services") || []; // Permite a seleção dos serviços serem "observadas"
  const selectedDate = watch("date");

  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  //Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      const PROFESSIONAL_ID = 10; // UNICA PROFESSIONAL NO MOMENTO

      if (
        !selectedDate ||
        typeof selectedDate !== "string" ||
        selectedDate.length === 0 ||
        isNaN(PROFESSIONAL_ID)
      ) {
        setOccupiedSlots([]);
        return;
      }

      setLoading(true);
      setOccupiedSlots([]);
      setValue("time", "");

      try {
        const response = await getProfessionalOccupiedSlots(
          PROFESSIONAL_ID,
          selectedDate,
        );
        setOccupiedSlots(response.occupiedSlots);
        console.log(occupiedSlots);
      } catch (error) {
        console.error(
          "Erro ao buscar horários ocupados (frontend):",
          error.errors || error.msg || error,
        ); // Mantenha este log
        setAlertMessage(error.msg || "Erro ao carregar horários disponíveis.");
        setAlertType("error");
        setShowAlert(true);
        setOccupiedSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, setValue]);

  // Horário não selecionado aciona o Alert
  useEffect(() => {
    if (errors.time) {
      setAlertMessage(errors.time.message);
      setAlertType("error");
      setShowAlert(true);
    }
  }, [errors.time]);

  // Adiciona ou remove os serviços da lista de serviços selecionados
  const toggleService = (service) => {
    const isSelected = selectedServices.includes(service);
    if (isSelected) {
      setValue(
        "services",
        selectedServices.filter((s) => s !== service),
      );
    } else {
      setValue("services", [...selectedServices, service]);
    }
  };

  const onSubmit = async (data) => {
    // Validação de serviços
    if (data.services.length === 0) {
      setAlertMessage("Selecione pelo menos um Serviço");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    // Validação de horário
    if (occupiedSlots.includes(data.time)) {
      setAlertMessage(
        "O horário selecionado está ocupado. Por favor, escolha outro.",
      );
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    console.log(data.services);

    setLoading(true);

    try {
      const response = await updateAppointment(id, {
        appointment_date: data.date,
        appointment_time: data.time,
        service_ids: data.services.map(Number),
      });

      console.log("Agendamento alterado com sucesso!", response);
      setAlertMessage("Agendamento alterado com sucesso!");
      setAlertType("success");
      setShowAlert(true);

      setTimeout(() => {
        navigate("/MeusAgendamentos");
      }, 1000);
    } catch (error) {
      console.error("Erro ao agendar horário:", error);

      const backendError = error;

      let errorMessage =
        "Erro ao agendar horário. Verifique os dados do seu agendamento.";

      if (
        Array.isArray(backendError?.errors) &&
        backendError.errors.length > 0
      ) {
        errorMessage =
          backendError.errors[0].msg || backendError.errors[0].message;
      } else if (backendError?.msg) {
        errorMessage = backendError.msg;
      }

      setAlertMessage(errorMessage);
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Loading />}
      <TopBar />
      <Alert
        show={showAlert}
        text={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
      <div className="relative my-3 flex items-center justify-center">
        <Link to="/MeusAgendamentos" className="absolute left-5">
          <ArrowLeft className="hover:text-primary" />
        </Link>
        <h1 className="text-primary font-raleway text-xl font-semibold">
          Editar Horário
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-8 flex flex-col gap-5"
      >
        <div className="citems-start flex flex-col gap-1">
          <label className="text-primary font-raleway text-lg font-medium">
            Selecionar a data:
          </label>

          <input
            type="date"
            min={formattedMinDate}
            defaultValue={formattedMinDate}
            max={formattedMaxDate}
            {...register("date", { required: true })}
            className="bg-secondary focus:outline-primary min-w-3xs cursor-pointer rounded-lg px-2 text-lg text-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-primary font-raleway text-lg font-medium">
            Selecione o Horário:
          </label>
          <Controller
            name="time"
            control={control}
            defaultValue=""
            rules={{ required: "Selecione um horário" }}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((t) => {
                  const occupied = occupiedSlots.includes(t);
                  const selected = field.value === t;

                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        field.onChange(t);
                        setShowAlert(false);
                      }}
                      disabled={occupied}
                      className={`rounded-xl border text-lg transition ${occupied ? "cursor-not-allowed bg-gray-700 text-white" : selected ? "bg-primary cursor-pointer text-white" : "border-primary text-primary cursor-pointer"}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          ></Controller>
        </div>
        <div>
          <label className="text-primary font-raleway text-lg font-medium">
            Selecione os serviço:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {services.map((s) => {
              const isSelected = selectedServices.includes(s.id);

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    toggleService(s.id);
                    setShowAlert(false);
                  }}
                  className={`cursor-pointer rounded-xl border text-lg transition ${isSelected ? "bg-primary text-white" : "border-primary text-primary"}`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-primary hover:bg-secondary w-max rounded-xl px-10 py-3 text-xl text-white"
          >
            Agendar
          </button>
        </div>
      </form>
    </div>
  );
};

export default index;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  getAppointments,
  cancelAppointment,
} from "../../../../services/clienteAppointmentService";

//Components
import TopBar from "../../../../components/TopBar";
import ImgDepilando from "../../../../components/ImgDepilando";
import Alert from "../../../../components/Alert";
import Loading from "../../../../components/Loading";

const Index = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  //Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);

    try {
      const response = await getAppointments();
      if (response.appointments && response.appointments.length > 0) {
        const fetchedAppointment = response.appointments[0];

        //Processando data
        const apptDataTime = new Date(fetchedAppointment.appointment_date_time);
        const day = apptDataTime.getDate().toString().padStart(2, "0");
        const month = (apptDataTime.getMonth() + 1).toString().padStart(2, "0");
        const year = apptDataTime.getFullYear();
        const time = apptDataTime.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dayOfWeek = apptDataTime.toLocaleDateString("pt-BR", {
          weekday: "long",
        });

        const total = fetchedAppointment.services.reduce((sum, s) => {
          return (
            sum + s.AppointmentService.service_price_at_time_of_booking / 100
          );
        }, 0);

        setAppointment({
          id: fetchedAppointment.id,
          date: `${day}/${month}/${year}`,
          dayofweek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
          time: time,
          status: fetchedAppointment.status,
          services: fetchedAppointment.services.map((s) => ({
            name: s.name,
            price: s.AppointmentService.service_price_at_time_of_booking / 100,
          })),
          total: total,
        });
      } else {
        setAppointment(null);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);

      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleEditAppointment = (appointmentId) => {
    navigate(`/EditarAgendamento/${appointmentId}`);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }

    try {
      setLoading(true);
      await cancelAppointment(appointmentId);

      setAlertMessage("Agendamento cancelado com sucesso!");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      const errorMessage =
        error.msg || "Erro ao cancelar agendamento. Tente novamente.";
      setAlertMessage(errorMessage);
      setAlertType("error");
      setShowAlert(true);
    } finally {
      fetchAppointments();
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-5">
      {loading && <Loading />}
      <TopBar />
      <Alert
        show={showAlert}
        text={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
      <div className="flex flex-col items-center">
        <ImgDepilando />

        {/* Agendamento encontrado */}
        {appointment ? (
          <div className="bg-white-sup flex max-w-md min-w-xs flex-col items-center gap-2.5 rounded-xl">
            <div className="flex w-full items-end justify-between p-2.5 pr-0">
              <div className="flex items-baseline gap-1">
                <div className="flex flex-col">
                  <h1 className="font-lato -mb-1 text-2xl font-bold">
                    {appointment.date}
                  </h1>
                  <p className="font-lato -mt-1 text-lg font-semibold">
                    {appointment.dayOfWeek}
                  </p>
                </div>
                <p className="text-sm">{appointment.time}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <h1
                  className={`rounded-tl-2xl rounded-bl-2xl px-5 py-1 text-white ${
                    appointment.status === "pending"
                      ? "bg-yellow-500"
                      : appointment.status === "confirmed"
                        ? "bg-green-500"
                        : appointment.status === "completed"
                          ? "bg-blue-500"
                          : appointment.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-gray-500"
                  }`}
                >
                  {/* {appointment.status.toUpperCase()}{" "} */}
                  {appointment.status === "pending"
                    ? "PENDENTE"
                    : appointment.status === "confirmed"
                      ? "CONFIRMADO"
                      : "null"}
                </h1>
              </div>
            </div>
            <h1 className="font-raleway text-base font-semibold">Serviços</h1>
            <div className="flex w-full flex-col gap-2 px-7 pb-2">
              <div className="max-h flex flex-col gap-2 overflow-auto">
                {appointment.services.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-end justify-between rounded-xl bg-[#FFD7E6] p-2.5"
                  >
                    <div className="flex gap-1">
                      <img
                        src={s.imagem || undefined}
                        className="h-14 w-14 rounded-xl bg-white"
                        alt={s.name}
                      />
                      <h1 className="font-playfair text-base font-medium">
                        {s.name}
                      </h1>
                    </div>
                    <p className="text-base font-medium">
                      R${s.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="font-lato flex justify-between rounded-xl bg-[#FFD7E6] p-2.5 text-base font-semibold">
                <p>Total:</p>
                <p>R${appointment.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="mb-2.5 flex w-full justify-around px-7">
              {appointment.status === "pending" ? (
                <button
                  className="bg-success rounded-md px-3 py-1 text-base text-white hover:bg-green-400"
                  onClick={() => handleEditAppointment(appointment.id)}
                >
                  Editar
                </button>
              ) : (
                <button
                  className="rounded-md bg-gray-400 px-3 py-1 text-base text-white hover:bg-gray-600"
                  onClick={() => {
                    setAlertMessage(
                      "Não e possivel editar agendamento confirmado",
                    );
                    setAlertType("warning");
                    setShowAlert(true);
                  }}
                >
                  Editar
                </button>
              )}
              <button
                className="bg-error rounded-md px-3 py-1 text-base text-white hover:bg-red-400"
                onClick={() => handleCancelAppointment(appointment.id)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-10 text-center text-lg text-gray-600">
            Você não possui agendamentos no momento. Que tal agendar um?
          </p>
        )}

        {/* Botão Agendar Horário */}
        <div className="mt-10 flex justify-center">
          {appointment ? (
            <button
              onClick={() => {
                setAlertMessage(
                  "Ops! Parece que você já tem um compromisso agendado.",
                );
                setAlertType("warning");
                setShowAlert(true);
              }}
              className="w-max cursor-not-allowed rounded-xl bg-gray-400 px-10 py-3 text-base text-white"
            >
              Agendar Horário
            </button>
          ) : (
            <Link to="/AgendarHorario">
              <button
                className={`bg-primary hover:bg-secondary w-max rounded-xl px-10 py-3 text-base text-white`}
              >
                Agendar Horário
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

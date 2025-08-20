import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence } from "motion/react";
import {
  getPendingAppointments,
  confirmAppointment,
  cancelAppointment,
} from "../../../../services/professionalAppointmentService";
import { getInitials } from "../../../../utils/initialsName";

//Components
import TopBar from "../../../../components/TopBar";
import ImgDepilando from "../../../../components/ImgDepilando";
import AppointmentRequestModal from "./AppointmentRequestModal";
import Alert from "../../../../components/Alert";
import Loading from "../../../../components/Loading";

//Lucide
import { CalendarDays } from "lucide-react";
import { Info } from "lucide-react";

const index = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  //Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getPendingAppointments();
      const raw = response.appointments || [];
      console.log(raw);

      if (raw.length > 0) {
        const tranformed = raw.map((appointment) => {
          const apptDataTime = new Date(appointment.appointment_date_time);

          const day = apptDataTime.getDate().toString().padStart(2, "0");
          const month = (apptDataTime.getMonth() + 1)
            .toString()
            .padStart(2, "0");
          const year = apptDataTime.getFullYear();

          const time = apptDataTime.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Fortaleza",
          });

          const rawDayOfWeek = apptDataTime.toLocaleDateString("pt-BR", {
            weekday: "long",
            timeZone: "America/Fortaleza",
          });

          const dayOfWeek =
            rawDayOfWeek.charAt(0).toUpperCase() + rawDayOfWeek.slice(1);

          const total = appointment.services.reduce((sum, s) => {
            return (
              sum + s.AppointmentService.service_price_at_time_of_booking / 100
            );
          }, 0);

          return {
            id: appointment.id,
            client: appointment.client,
            date: `${day}/${month}/${year}`,
            dayofweek: dayOfWeek,
            time: time,
            appointmentRequestDate: appointment.updatedAt,
            services: appointment.services.map((s) => ({
              name: s.name,
              price: s.price / 100,
            })),
            appointmentValue: total,
            status: appointment.status,
          };
        });
        console.log("raw", tranformed);
        setAppointments(tranformed);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Calcula o tempo decorrido desde a criação da solicitação
  const runningTimeAppointment = (data) => {
    const currentDate = new Date();
    const dateAppointment = new Date(data);

    const differenceMil = currentDate - dateAppointment;
    const differenceMin = Math.floor(differenceMil / 1000 / 60);

    // Até 60 minutos exibe em minutos
    if (differenceMin <= 60) {
      const textMinute = differenceMin === 1 ? "minuto" : "minutos";
      return `Há ${differenceMin} ${textMinute}`;
    }

    // Exibe em horas (arrendondando para cima) se passar para 60 minutos
    const hours = Math.ceil(differenceMin / 60);
    const textHours = hours === 1 ? "hora" : "horas";

    return `Há ${hours} ${textHours}`;
  };

  const handleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleConfirmAppointment = async (appointmentId) => {
    if (!window.confirm("Tem certeza que deseja confirma este agendamento?")) {
      return;
    }

    try {
      setLoading(true);

      await confirmAppointment(appointmentId);

      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));

      setAlertMessage("Agendamento confirmado com sucesso!");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      const errorMessage =
        error.msg || "Erro ao confirmar agendamento. Tente novamente.";
      setAlertMessage(errorMessage);
      setAlertType("error");
      setShowAlert(true);
    } finally {
      await fetchAppointments();
      setModalOpen(false);
      setSelectedAppointment(null);
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Tem certeza que deseja rejeitar este agendamento?")) {
      return;
    }
    try {
      setLoading(true);

      await cancelAppointment(appointmentId);

      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));

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
      await fetchAppointments();
      setModalOpen(false);
      setSelectedAppointment(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {loading && <Loading />}
      <TopBar />
      <Alert
        show={showAlert}
        text={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
      <div className="relative flex flex-col items-center gap-5">
        <AnimatePresence>
          {modalOpen && (
            <div
              className="bg-opacity-10 fixed inset-0 z-40 flex justify-center"
              onClick={() => setModalOpen(false)}
            >
              <AppointmentRequestModal
                isOpen={modalOpen}
                isClose={() => setModalOpen(false)}
                appointment={selectedAppointment}
                onReject={() => handleCancelAppointment(selectedAppointment.id)}
                onAccept={() =>
                  handleConfirmAppointment(selectedAppointment.id)
                }
              />
            </div>
          )}
        </AnimatePresence>
        <div
          className={`flex flex-col items-center gap-5 transition-all duration-400 ${modalOpen ? `pointer-events-none blur-sm` : ``}`}
        >
          <ImgDepilando />
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="font-playfair text-primary text-center text-2xl font-bold">
              Solicitações de Agendamentos
            </h1>
          </div>
          {appointments.length > 0 ? (
            <div>
              <div className="overflow'-auto flex max-h-50 min-w-2xs cursor-pointer flex-col gap-2.5 scroll-auto">
                {appointments.map((appointment) => (
                  <div
                    className="bg-white-sup hover:bg-secondary flex items-center justify-between rounded-lg p-2"
                    key={appointment.id}
                    onClick={() => handleClick(appointment)}
                  >
                    <div className="flex gap-2">
                      <div className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                        <span className="font-medium text-gray-600">
                          {getInitials(appointment.client.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-playfair text-xl font-semibold">
                          {appointment.client.name}
                        </p>
                        <p className="text-xs">
                          {runningTimeAppointment(
                            appointment.appointmentRequestDate,
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <Info className="text-blue-700 hover:text-blue-900" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-sm">
              <p>Nenhuma solicitação de agendamento no momento.</p>
            </div>
          )}

          <Link
            to="/Agenda"
            className="bg-primary hover:bg-secondary flex size-16 cursor-pointer items-center justify-center rounded-full text-white"
          >
            <CalendarDays className="size-8" />
          </Link>
        </div>
      </div>{" "}
    </div>
  );
};

export default index;

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence } from "motion/react";
import {
  getConfirmedAppointments,
  completeAppointment,
  cancelAppointment,
} from "../../../../services/professionalAppointmentService";

//Components
import TopBar from "../../../../components/TopBar";
import ImgDepilando from "../../../../components/ImgDepilando";
import AppointmentRequestModal from "./AppointmentRequestModal";
import GroupedAppointmentsList from "./GroupedAppointmentsList";
import Alert from "../../../../components/Alert";
import Loading from "../../../../components/Loading";

//Lucide
import { Inbox } from "lucide-react";

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
      const response = await getConfirmedAppointments();
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

  const handleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const HandleCompleteAppointment = async (appointmentId) => {
    if (!window.confirm("Tem certeza que deseja concluir este agendamento?")) {
      return;
    }
    try {
      setLoading(true);

      await completeAppointment(appointmentId);

      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));

      setAlertMessage("Agendamento concluido com sucesso!");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
      const errorMessage =
        error.msg || "Erro ao concluir agendamento. Tente novamente.";
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
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
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
              className="bg-opacity-10 fixed inset-0 z-40 flex items-center justify-center"
              onClick={() => setModalOpen(false)}
            >
              <AppointmentRequestModal
                isOpen={modalOpen}
                isClose={() => setModalOpen(false)}
                appointment={selectedAppointment}
                onComplete={() =>
                  HandleCompleteAppointment(selectedAppointment.id)
                }
                onCancel={() => handleCancelAppointment(selectedAppointment.id)}
              />
            </div>
          )}
        </AnimatePresence>
        <div
          className={`flex flex-col items-center gap-5 transition-all duration-300 ${modalOpen ? `pointer-events-none blur-sm` : ``}`}
        >
          <ImgDepilando />
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="font-playfair text-primary text-center text-2xl font-bold">
              Agenda
            </h1>
            {appointments.length > 0 ? (
              <GroupedAppointmentsList
                appointments={appointments}
                onClick={handleClick}
              />
            ) : (
              <h1>Nenhuma agendamento no momento.</h1>
            )}
          </div>
          <Link
            to="/Solicitacoes"
            className="bg-primary hover:bg-secondary flex size-16 cursor-pointer items-center justify-center rounded-full text-white"
          >
            <Inbox className="size-8" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default index;

import React from "react";
import { motion } from "motion/react";

//Lucide
import { X } from "lucide-react";

const AppointmentRequestModal = ({
  isOpen,
  isClose,
  appointment,
  onComplete,
  onCancel,
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <motion.div
      className="bg-white-sup absolute top-1/6 flex min-w-80 flex-col rounded-xl p-2.5"
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, scale: 0.8, y: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -30 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex justify-end">
        <X className="hover:text-error cursor-pointer" onClick={isClose} />
      </div>
      <h1 className="font-playfair text-center text-2xl font-semibold">
        {appointment.client.name}
      </h1>
      <div className="m-2.5 flex flex-col gap-2.5 border-t border-b py-2.5">
        <p className="font-lato text-center text-lg">Serviços</p>
        <div className="flex flex-col gap-1.5">
          {appointment.services.map((service) => (
            <div className="font-lato flex justify-between px-2.5 text-base">
              <p>{service.name}</p>
              <p>
                {service.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          ))}
        </div>
        <div className="font-lato flex justify-around text-base font-semibold">
          <p>Total:</p>
          <p>
            {appointment.appointmentValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div className="font-lato flex items-center justify-evenly text-base font-semibold text-white">
          <p className="bg-primary rounded-sm px-2.5">{appointment.date}</p>
          <p className="bg-primary rounded-sm px-2.5">{appointment.time}Hrs</p>
        </div>
      </div>
      <div className="font-lato m-2.5 flex justify-around text-lg font-medium text-white">
        <button
          className="bg-error cursor-pointer rounded-sm px-2.5 hover:bg-red-400"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="bg-success cursor-pointer rounded-sm px-2.5 hover:bg-green-400"
          onClick={onComplete}
        >
          Finalizar
        </button>
      </div>
    </motion.div>
  );
};

export default AppointmentRequestModal;

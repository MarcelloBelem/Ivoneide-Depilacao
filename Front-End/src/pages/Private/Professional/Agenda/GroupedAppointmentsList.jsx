import React from "react";
import { Info } from "lucide-react";
import { getInitials } from "../../../../utils/initialsName";

const GroupedAppointmentsList = ({ appointments, onClick }) => {
  const groupAppointmentsByDate = (appointments) => {
    const grouped = {};

    appointments.forEach((item) => {
      const [day, month, year] = item.date.split("/");
      const dateObj = new Date(year, month - 1, day);

      const today = new Date();
      const todayObj = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const tomorrowObj = new Date(todayObj);
      tomorrowObj.setDate(tomorrowObj.getDate() + 1);

      let label;
      if (dateObj.getTime() < todayObj.getTime()) {
        label = "Já passou";
      } else if (dateObj.getTime() === todayObj.getTime()) {
        label = "Hoje";
      } else if (dateObj.getTime() === tomorrowObj.getTime()) {
        label = "Amanhã";
      } else {
        const dia = String(dateObj.getDate()).padStart(2, "0");
        const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
        const ano = dateObj.getFullYear();
        label = `${dia}/${mes}/${ano}`;
      }

      if (!grouped[label]) {
        grouped[label] = {
          date: dateObj,
          appointments: [],
        };
      }
      grouped[label].appointments.push(item);
    });

    return grouped;
  };

  const groupedAppointments = groupAppointmentsByDate(appointments);

  // Ordenar os grupos por data crescente
  const sortedGroups = Object.entries(groupedAppointments).sort((a, b) => {
    const dataA = a[1].data;
    const dataB = b[1].data;
    return dataA - dataB;
  });

  return (
    <div className="flex max-h-[calc(50vh-100px)] min-w-2xs cursor-pointer flex-col gap-2.5 overflow-auto scroll-auto">
      {sortedGroups.map(([label, { appointments }]) => (
        <div key={label} className="bg flex flex-col gap-2.5">
          <h2
            className={`font-lato text-lg font-semibold ${
              label === "Já passou" ? "text-red-500" : "text-primary"
            }`}
          >
            {label}
          </h2>
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white-sup hover:bg-secondary flex items-center justify-between rounded-lg p-2"
              onClick={() => onClick(appointment)}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  <span className="font-medium text-gray-600">
                    {getInitials(appointment.client.name)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className="font-playfair text-xl font-semibold">
                    {appointment.client.name}
                  </p>
                  <p className="text-base">{appointment.time}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <Info className="text-blue-700 hover:text-blue-900" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GroupedAppointmentsList;

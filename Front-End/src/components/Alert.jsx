import React from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

//Lucide Icons
import { CircleCheck, CircleAlert, TriangleAlert, Info } from "lucide-react";

const icons = {
  success: <CircleCheck />,
  error: <CircleAlert />,
  warning: <TriangleAlert />,
  info: <Info />,
};

const styles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-800",
    iconColor: "text-green-500",
    buttonBg: "bg-green-100 hover:bg-green-200",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-800",
    iconColor: "text-red-500",
    buttonBg: "bg-red-100 hover:bg-red-200",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-800",
    iconColor: "text-yellow-500",
    buttonBg: "bg-yellow-100 hover:bg-yellow-200",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-800",
    iconColor: "text-blue-500",
    buttonBg: "bg-blue-100 hover:bg-blue-200",
  },
};

const Alert = ({ show, text, onClose, type = "info", duration = 2500 }) => {
  const icon = icons[type];
  const style = styles[type];

  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration, show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed top-4 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 transform rounded-md border-t-4 transition-all duration-300 ease-in-out ${style.border} ${style.bg} p-4 ${style.text} shadow-lg`}
          role="alert"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.1 }}
        >
          <div className="flex items-center justify-center">
            <div className={`${style.iconColor}`}>{icon}</div>
            <span className="ml-3 text-sm font-medium">{text}</span>
            <button
              onClick={onClose}
              className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded ${style.buttonBg} ${style.iconColor}`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7L1 13"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { getUserFromToken } from "../../utils/jwtDecode";

//Components
import Alert from "../Alert";

const UserDropDown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  //Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  //Dados do usuário
  const [userData, setUserData] = useState({ name: "", email: "" });

  const handleToggle = () => setIsOpen(!isOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  //Logout
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    setIsOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const userDataFromToken = getUserFromToken();

    if (userDataFromToken) {
      setUserData(userDataFromToken);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Alert
        show={showAlert}
        text={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />
      <img
        onClick={handleToggle}
        className="h-12 w-12 cursor-pointer rounded-full"
        src="data:image/jpeg;base64,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"
        alt="User avatar"
      />

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow">
          <div className="px-4 py-3 text-sm text-gray-900">
            <div>{userData.name}</div>
            <div className="truncate font-medium">{userData.email}</div>
          </div>
          <ul className="py-2 text-sm text-gray-700">
            <li>
              <a
                href="#"
                className="hover:bg-white-sup block px-4 py-2"
                onClick={() => {
                  setAlertMessage("Função em desenvolvimento");
                  setAlertType("warning");
                  setShowAlert(true);
                }}
              >
                Perfil
              </a>
            </li>
          </ul>
          <div className="py-1">
            <a
              href="#"
              className="hover:bg-white-sup block px-4 py-2 text-sm text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              Sair
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropDown;

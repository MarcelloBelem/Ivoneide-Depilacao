import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/jwtDecode";

//Components
import UserDropDown from "./UserDropDown";

const index = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userNameFromToken = getUserFromToken();

    if (userNameFromToken) {
      setUserName(userNameFromToken.name);
    }
  }, []);
  return (
    <div className="bg-primary flex items-end justify-between p-3 shadow-xl">
      <p className="font-playfair text-2xl font-extrabold text-white">
        {userName}
      </p>
      <UserDropDown />
    </div>
  );
};

export default index;

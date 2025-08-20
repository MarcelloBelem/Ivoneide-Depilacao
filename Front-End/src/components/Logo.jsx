import React from "react";
import Minhalogo from "../assets/Logo.png";

const Logo = () => {
  return (
    <div>
      <picture>
        <img src={Minhalogo} alt="Logo" className="h-auto w-52" />
      </picture>
    </div>
  );
};

export default Logo;

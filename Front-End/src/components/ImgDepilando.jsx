import React from "react";
import MulherDepilando from "../assets/mulherDepilando.png";

const ImgDepilando = () => {
  return (
    <div>
      <picture>
        <img
          src={MulherDepilando}
          alt="Mulher Depilando"
          className="h-auto w-44"
        />
      </picture>
    </div>
  );
};

export default ImgDepilando;

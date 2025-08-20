import React from "react";
import loadingGif from "../assets/loadingTest.gif";

const Loading = () => {
  return (
    <div
      style={{
        position: "fixed", // cobre toda a tela
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999, // fica acima de todos os elementos
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)", // fundo semi-transparente
        pointerEvents: "all", // bloqueia interações
        cursor: "wait", // cursor de espera
      }}
    >
      <img
        src={loadingGif}
        alt="Carregando..."
        style={{ width: "500px", height: "286px", objectFit: "contain" }}
      />
    </div>
  );
};

export default Loading;

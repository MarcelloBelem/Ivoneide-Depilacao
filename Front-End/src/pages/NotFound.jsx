import React from "react";

const NotFound = () => {
  return (
    <div class="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div class="text-center">
        <p class="text-primary text-base font-semibold">404</p>
        <h1 class="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Página não encontrada
        </h1>
        <p class="text-primary mt-6 text-lg font-medium text-pretty sm:text-xl/8">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
      </div>
    </div>
  );
};

export default NotFound;

export const formatWhatsapp = (value) => {
  // Remove tudo que não é número
  let digits = value.replace(/\D/g, "");

  // Limita a 11 dígitos no máximo
  if (digits.length > 11) digits = digits.slice(0, 11);

  if (digits.length <= 2) {
    return digits; // Apenas DDD
  }

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) {
    return `(${ddd}) ${rest}`;
  }

  if (rest.length === 8) {
    // Número fixo ou celular antigo sem 9
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  if (rest.length >= 9) {
    // Número celular com 9
    return `(${ddd}) ${rest.slice(0, 1)} ${rest.slice(1, 5)}-${rest.slice(5)}`;
  }

  // Para números entre 5 e 7 dígitos
  return `(${ddd}) ${rest}`;
};

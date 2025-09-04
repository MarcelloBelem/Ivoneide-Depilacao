//Formata numero para o padrão E.164
export const formatPhoneNumber = (phone) => {
  let cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone.startsWith("55")) {
    cleanPhone = `55${cleanPhone}`;
  }
  return cleanPhone;
};

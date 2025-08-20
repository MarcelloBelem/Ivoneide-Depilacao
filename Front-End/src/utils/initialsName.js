export const getInitials = (fullName) => {
  const names = fullName.trim().split(" ");
  const first = names[0]?.charAt(0).toUpperCase() || "";
  const last = names[1]?.charAt(0).toUpperCase() || "";
  return first + last;
};

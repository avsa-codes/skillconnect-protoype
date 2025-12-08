export const isAdminLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("admin_session") === "super_admin";
};

export const adminLogin = (password: string) => {
  if (password === process.env.NEXT_PUBLIC_ADMIN_SUPER_SECRET) {
    localStorage.setItem("admin_session", "super_admin");
    return true;
  }
  return false;
};

export const adminLogout = () => {
  localStorage.removeItem("admin_session");
};

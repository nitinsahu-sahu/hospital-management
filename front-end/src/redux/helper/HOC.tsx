import { Navigate } from "react-router";

const Protected = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const expiresAt = localStorage.getItem("expiresAt");

  const isAuthenticated =
    token &&
    expiresAt &&
    Date.now() < parseInt(expiresAt, 10);

  if (!isAuthenticated) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("expiresAt");

    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default Protected;
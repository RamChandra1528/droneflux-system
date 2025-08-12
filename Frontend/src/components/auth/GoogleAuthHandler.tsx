import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function GoogleAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userStr = params.get("user");

    if (token && userStr) {
      localStorage.setItem("droneflux-token", token);
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("droneflux-user", JSON.stringify(user));
        setUser(user);
        navigate("/dashboard");
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [location, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Logging you in with Google...
    </div>
  );
}
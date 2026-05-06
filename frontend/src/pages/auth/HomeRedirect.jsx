import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/common/LoadingScreen";

export default function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    setTimeout(() => {
      if (!token) {
        navigate("/login");
        return;
      }

      if (user?.role === "student") {
        navigate("/questions");
      } else if (user?.role === "teacher") {
        navigate("/teacher/submissions");
      } else {
        navigate("/questions");
      }
    }, 500); // slight delay for smoother UX

  }, [navigate]);

  return <LoadingScreen />;
}
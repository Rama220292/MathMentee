import { useForm } from "react-hook-form";
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "../../services/authService";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required")
});

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await login(data);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      console.log(res);
      toast.success("Welcome back!");
      navigate("/questions/create");
    } catch (err) {
      toast.error(err.response?.data?.err || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background (same as Signup) */}
      <div
        className="absolute inset-0 bg-center bg-[length:110%]"
        style={{ backgroundImage: "url('/images/Background_1.png')" }}
      />

      {/* Overlay (same as Signup) */}
      <div className="absolute inset-0 bg-black/1.5 backdrop-blur-[0px]" />

      {/* Card */}
      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">

        {/* Toggle Buttons */}
        <div className="flex mb-6 rounded-lg overflow-hidden border">
          <button
            className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="flex-1 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Signup
          </button>
        </div>

        {/* Logo (same size as Signup) */}
        <div className="flex justify-center mb-4">
          <img
            src="/images/MMLogo.png"
            alt="MathMentor Logo"
            className="w-32 md:w-40 lg:w-62 object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-1">
            Sign in to MathMentor
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Email */}
          <div>
            <div className="flex items-center border rounded-lg px-3 focus-within:ring-2 focus-within:ring-purple-400">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                {...register("email")}
                placeholder="Email"
                className="w-full py-2 outline-none"
              />
            </div>
            <p className="text-red-500 text-sm mt-1">
              {errors.email?.message}
            </p>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center border rounded-lg px-3 focus-within:ring-2 focus-within:ring-purple-400">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="password"
                {...register("password")}
                placeholder="Password"
                className="w-full py-2 outline-none"
              />
            </div>
            <p className="text-red-500 text-sm mt-1">
              {errors.password?.message}
            </p>
          </div>

          {/* Submit */}
          <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-medium 
            bg-gradient-to-r from-purple-500 to-indigo-500 
            transition flex items-center justify-center
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Logging in...
            </span>
          ) : (
            "Sign up" // or "Sign in"
          )}
          </button>

        </form>

      </div>
    </div>
  );
}
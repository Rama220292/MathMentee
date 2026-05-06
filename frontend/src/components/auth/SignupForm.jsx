import { useForm } from "react-hook-form";
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signup } from "../../services/authService";
import { Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[a-z]/, "Must include lowercase")
    .regex(/[A-Z]/, "Must include uppercase")
    .regex(/[0-9]/, "Must include number")
    .regex(/[^a-zA-Z0-9]/, "Must include special character"),
  role: z.enum(["student", "teacher"])
});

export default function SignupForm() {
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
      await signup(data);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      toast.success("Signup successful.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.err || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-center bg-[length:110%]"
     style={{backgroundImage: "url('/images/Background_1.png')"}}>

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/1.5 backdrop-blur-[0px]" />
    
      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex mb-6 rounded-lg overflow-hidden border">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex-1 py-2 bg-gray-100 text-gray-600"
          >
            Login
          </button>
          <button
            className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            Signup
          </button>
        </div>

        {/* Logo */}
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
            Create An Account
          </h1>
        </div>


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Name */}
          <div>
            <div className="flex items-center border rounded-lg px-3">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input
                {...register("name")}
                placeholder="Name"
                className="w-full py-2 outline-none"
              />
            </div>
            <p className="text-red-500 text-sm mt-1">
              {errors.name?.message}
            </p>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center border rounded-lg px-3">
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
            <div className="flex items-center border rounded-lg px-3">
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

          {/* Role */}
          <div>
            <select
              {...register("role")}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
            >
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <p className="text-red-500 text-sm mt-1">
              {errors.role?.message}
            </p>
          </div>

          {/* Button */}
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
                Creating account...
              </span>
            ) : (
              "Sign up"
            )}
          </button>

        </form>

      </div>
    </div>
  );
}